import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useLoaderData, useRevalidator } from "react-router";
import type { Route } from "./+types/dashboard.users";
import { getAllUsers } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.middleware";
import { useActivity } from "~/contexts/ActivityContext";
import { UserTable } from "~/components/users/UserTable";
import { UserCreateDialog } from "~/components/users/UserCreateDialog";
import { UserEditDialog } from "~/components/users/UserEditDialog";
import { UserDeleteDialog } from "~/components/users/UserDeleteDialog";
import { UserBanDialog } from "~/components/users/UserBanDialog";
import { UserSearch } from "~/components/users/UserSearch";
import { BulkActions } from "~/components/users/BulkActions";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { SearchFilters, User } from "~/types";

interface DashboardContext {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "User Management - Dashboard" },
    { name: "description", content: "Manage users in the system" },
  ];
}

// Loader - fetch users on server from configured database
export async function loader() {
  const users = await getAllUsers();
  // Sort by createdAt descending (newest first)
  const sortedUsers = users.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  return { users: sortedUsers };
}

// Action - handle user update and unban requests (admin only)
export async function action({ request }: Route.ActionArgs) {
  // Require admin role for all actions
  await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = formData.get("userId") as string;
  const userIds = formData.getAll("userIds").map((value) => value?.toString()).filter(Boolean) as string[];

  if (intent === "update" && userId) {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const emailVerified = formData.get("emailVerified") === "true";

    try {
      // Use Better Auth database operations for user management
      const { updateUser } = await import("~/lib/user-management.server");

      await updateUser(userId, {
        email,
        name,
        role: role as "user" | "admin",
        emailVerified,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Failed to update user:", error);
      return { success: false, error: error.message || "Failed to update user" };
    }
  }

  if (intent === "ban" && userId) {
    const banReason = formData.get("banReason") as string || "Banned by administrator";

    try {
      // Use Better Auth database operations to ban user
      const { banUser } = await import("~/lib/user-management.server");

      await banUser(userId, banReason);

      return { success: true };
    } catch (error: any) {
      console.error("Failed to ban user:", error);
      return { success: false, error: error.message || "Failed to ban user" };
    }
  }

  if (intent === "unban" && userId) {
    try {
      // Use Better Auth database operations to unban user
      const { unbanUser } = await import("~/lib/user-management.server");

      await unbanUser(userId);

      return { success: true };
    } catch (error: any) {
      console.error("Failed to unban user:", error);
      return { success: false, error: error.message || "Failed to unban user" };
    }
  }

  if (intent === "bulk-ban" && userIds.length) {
    const banReason = (formData.get("banReason") as string) || undefined;
    try {
      const { banUser } = await import("~/lib/user-management.server");
      await Promise.all(userIds.map((id) => banUser(id, banReason)));
      return { success: true };
    } catch (error: any) {
      console.error("Failed to bulk ban users:", error);
      return { success: false, error: error.message || "Failed to bulk ban users" };
    }
  }

  if (intent === "bulk-unban" && userIds.length) {
    try {
      const { unbanUser } = await import("~/lib/user-management.server");
      await Promise.all(userIds.map((id) => unbanUser(id)));
      return { success: true };
    } catch (error: any) {
      console.error("Failed to bulk unban users:", error);
      return { success: false, error: error.message || "Failed to bulk unban users" };
    }
  }

  if (intent === "bulk-role" && userIds.length) {
    const role = formData.get("role") as string;
    if (role !== "admin" && role !== "user") {
      return { success: false, error: "Invalid role selected" };
    }

    try {
      const { updateUser } = await import("~/lib/user-management.server");
      await Promise.all(userIds.map((id) => updateUser(id, { role })));
      return { success: true };
    } catch (error: any) {
      console.error("Failed to bulk update roles:", error);
      return { success: false, error: error.message || "Failed to update user roles" };
    }
  }

  if (intent === "bulk-delete" && userIds.length) {
    try {
      const { deleteUser } = await import("~/lib/user-management.server");
      await Promise.all(userIds.map((id) => deleteUser(id)));
      return { success: true };
    } catch (error: any) {
      console.error("Failed to bulk delete users:", error);
      return { success: false, error: error.message || "Failed to delete selected users" };
    }
  }

  if (intent === "delete" && userId) {
    try {
      // Use Better Auth database operations to delete user
      const { deleteUser } = await import("~/lib/user-management.server");

      await deleteUser(userId);

      return { success: true };
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      return { success: false, error: error.message || "Failed to delete user" };
    }
  }

  if (intent === "create") {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;

    try {
      // Use Better Auth database operations to create user
      const { createUser } = await import("~/lib/user-management.server");

      await createUser({
        email,
        password,
        name,
        role: role as "user" | "admin",
        emailVerified: true, // Auto-verify admin-created users
      });

      return { success: true };
    } catch (error: any) {
      console.error("Failed to create user:", error);
      return { success: false, error: error.message || "Failed to create user" };
    }
  }

  return { success: false };
}

// Main component
export default function DashboardUsers() {
  const { users } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<DashboardContext>();
  const { logActivity } = useActivity();
  const revalidator = useRevalidator();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    role: "all",
    status: "all",
  });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const itemsPerPage = 10;

  const filteredUsers = useMemo(() => {
    return users.filter((currentUser) => {
      const createdAt = new Date(currentUser.createdAt);

      if (filters.query) {
        const query = filters.query.toLowerCase().trim();
        if (
          !currentUser.name.toLowerCase().includes(query) &&
          !currentUser.email.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (filters.role && filters.role !== "all" && currentUser.role !== filters.role) {
        return false;
      }

      if (filters.status && filters.status !== "all") {
        if (filters.status === "active" && (currentUser.banned || !currentUser.emailVerified)) {
          return false;
        }
        if (filters.status === "pending" && (currentUser.banned || currentUser.emailVerified)) {
          return false;
        }
        if (filters.status === "banned" && !currentUser.banned) {
          return false;
        }
      }

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (createdAt < from) {
          return false;
        }
      }

      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        if (createdAt > to) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters]);

  const totalResults = filteredUsers.length;

  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage) || 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const selectedUsers = useMemo(
    () => users.filter((item) => selectedUserIds.includes(item.id)),
    [users, selectedUserIds]
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateUser = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = ["Email", "Name", "Status", "Role", "Created At"];
    const rows = filteredUsers.map((item) => {
      const status = item.banned ? "Banned" : item.emailVerified ? "Active" : "Pending";
      const createdAt = new Date(item.createdAt).toISOString();
      return [item.email, item.name, status, item.role, createdAt]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `users-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Exported users to CSV");
  };

  const performBulkAction = async (
    intent: "bulk-ban" | "bulk-unban" | "bulk-role" | "bulk-delete",
    userIds: string[],
    extra?: Record<string, string>
  ) => {
    if (userIds.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.append("intent", intent);
    userIds.forEach((id) => formData.append("userIds", id));
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(window.location.pathname, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Bulk action request failed");
    }

    const result = await response.json();

    if (!result?.success) {
      throw new Error(result?.error || "Bulk action failed");
    }
  };

  const getUsersByIds = (userIds: string[]) =>
    users.filter((item) => userIds.includes(item.id));

  const handleBulkBan = async (userIds: string[]) => {
    try {
      await performBulkAction("bulk-ban", userIds);
      const targets = getUsersByIds(userIds).map((item) => item.email).join(", ");
      toast.success(`Banned ${userIds.length} user(s)`);
      logActivity({
        action: "Banned multiple users",
        user: user.name,
        target: targets || `${userIds.length} users`,
        type: "ban",
      });
      setSelectedUserIds((prev) => prev.filter((id) => !userIds.includes(id)));
      revalidator.revalidate();
    } catch (error) {
      toast.error("Failed to ban selected users");
      throw error;
    }
  };

  const handleBulkUnban = async (userIds: string[]) => {
    try {
      await performBulkAction("bulk-unban", userIds);
      const targets = getUsersByIds(userIds).map((item) => item.email).join(", ");
      toast.success(`Unbanned ${userIds.length} user(s)`);
      logActivity({
        action: "Unbanned multiple users",
        user: user.name,
        target: targets || `${userIds.length} users`,
        type: "unban",
      });
      setSelectedUserIds((prev) => prev.filter((id) => !userIds.includes(id)));
      revalidator.revalidate();
    } catch (error) {
      toast.error("Failed to unban selected users");
      throw error;
    }
  };

  const handleBulkRoleChange = async (userIds: string[], role: string) => {
    try {
      await performBulkAction("bulk-role", userIds, { role });
      const targets = getUsersByIds(userIds).map((item) => item.email).join(", ");
      toast.success(`Updated role for ${userIds.length} user(s)`);
      logActivity({
        action: `Updated role to ${role}`,
        user: user.name,
        target: targets || `${userIds.length} users`,
        type: "edit",
      });
      setSelectedUserIds((prev) => prev.filter((id) => !userIds.includes(id)));
      revalidator.revalidate();
    } catch (error) {
      toast.error("Failed to update roles");
      throw error;
    }
  };

  const handleBulkDelete = async (userIds: string[]) => {
    try {
      await performBulkAction("bulk-delete", userIds);
      const targets = getUsersByIds(userIds).map((item) => item.email).join(", ");
      toast.success(`Deleted ${userIds.length} user(s)`);
      logActivity({
        action: "Deleted multiple users",
        user: user.name,
        target: targets || `${userIds.length} users`,
        type: "delete",
      });
      setSelectedUserIds((prev) => prev.filter((id) => !userIds.includes(id)));
      revalidator.revalidate();
    } catch (error) {
      toast.error("Failed to delete selected users");
      throw error;
    }
  };

  const handleBulkEmail = (userIds: string[]) => {
    const targets = getUsersByIds(userIds);
    if (targets.length === 0) {
      toast.info("No users selected for email");
      return;
    }

    const emails = targets.map((item) => item.email).join(",");
    window.location.href = `mailto:${emails}`;
    toast.success("Opened email composer for selected users");
  };

  const handleRowSelectChange = (targetUser: User, isSelected: boolean) => {
    setSelectedUserIds((prev) => {
      if (isSelected) {
        if (prev.includes(targetUser.id)) {
          return prev;
        }
        return [...prev, targetUser.id];
      }
      return prev.filter((id) => id !== targetUser.id);
    });
  };

  const handleSelectAllChange = (select: boolean) => {
    if (select) {
      setSelectedUserIds((prev) => {
        const existing = new Set(prev);
        paginatedUsers.forEach((item) => existing.add(item.id));
        return Array.from(existing);
      });
      return;
    }

    setSelectedUserIds((prev) =>
      prev.filter((id) => !paginatedUsers.some((item) => item.id === id))
    );
  };

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalResults / itemsPerPage) || 1);
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [totalResults, itemsPerPage, currentPage]);

  useEffect(() => {
    setSelectedUserIds((prev) => {
      const allowedIds = new Set(filteredUsers.map((item) => item.id));
      const next = prev.filter((id) => allowedIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredUsers]);

  const handleCreateSuccess = (email: string, name: string) => {
    toast.success("User created successfully");
    logActivity({
      action: "Created new user",
      user: user.name,
      target: email,
      type: "create",
    });
    revalidator.revalidate();
  };

  const handleEditSuccess = () => {
    toast.success("User updated successfully");
    if (selectedUser) {
      logActivity({
        action: "Updated user profile",
        user: user.name,
        target: selectedUser.email,
        type: "edit",
      });
    }
    revalidator.revalidate();
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  const handleDeleteSuccess = () => {
    toast.success("User deleted successfully");
    if (selectedUser) {
      logActivity({
        action: "Deleted user",
        user: user.name,
        target: selectedUser.email,
        type: "delete",
      });
    }
    revalidator.revalidate();
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  const handleBan = (user: User) => {
    setSelectedUser(user);
    setIsBanDialogOpen(true);
  };

  const handleUnban = async (targetUser: User) => {
    try {
      // Submit form to unban user via action
      const formData = new FormData();
      formData.append("intent", "unban");
      formData.append("userId", targetUser.id);

      await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
      });

      toast.success(`${targetUser.name} has been unbanned`);
      logActivity({
        action: "Unbanned user",
        user: user.name,
        target: targetUser.email,
        type: "unban",
      });
      revalidator.revalidate();
    } catch (error) {
      toast.error("Failed to unban user");
    }
  };

  const handleBanSuccess = () => {
    toast.success(`${selectedUser?.name} has been banned`);
    if (selectedUser) {
      logActivity({
        action: "Banned user",
        user: user.name,
        target: selectedUser.email,
        type: "ban",
      });
    }
    revalidator.revalidate();
  };

  const handleBanDialogChange = (open: boolean) => {
    setIsBanDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  const isAdmin = user.role === "admin";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin ? "Manage and monitor all users" : "View all users (read-only)"}
          </p>
        </div>
        <Button onClick={handleCreateUser} size="default" disabled={!isAdmin}>
          Create User
        </Button>
      </div>

      <div className="mb-6 space-y-4 shrink-0">
        <UserSearch onSearch={handleSearch} onExport={handleExport} totalResults={totalResults} />
        {isAdmin && selectedUsers.length > 0 && (
          <div className="flex justify-end">
            <BulkActions
              selectedUsers={selectedUsers}
              onBulkBan={handleBulkBan}
              onBulkUnban={handleBulkUnban}
              onBulkRoleChange={handleBulkRoleChange}
              onBulkDelete={handleBulkDelete}
              onBulkEmail={handleBulkEmail}
            />
          </div>
        )}
      </div>

      {/* User Table - Scrollable */}
      <div className="flex-1 overflow-auto">
        <UserTable
          users={paginatedUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBan={handleBan}
          onUnban={handleUnban}
          isLoading={false}
          isAdmin={isAdmin}
          selectable={isAdmin}
          selectedUserIds={selectedUserIds}
          onSelectChange={handleRowSelectChange}
          onSelectAllChange={handleSelectAllChange}
        />
      </div>

      {/* Pagination */}
      {totalResults > itemsPerPage && (
        <div className="mt-4 flex items-center justify-between border-t pt-4 shrink-0">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      <UserCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit User Dialog */}
      <UserEditDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogChange}
        onSuccess={handleEditSuccess}
      />

      {/* Delete User Dialog */}
      <UserDeleteDialog
        user={selectedUser}
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        onSuccess={handleDeleteSuccess}
      />

      {/* Ban User Dialog */}
      <UserBanDialog
        user={selectedUser}
        open={isBanDialogOpen}
        onOpenChange={handleBanDialogChange}
        onSuccess={handleBanSuccess}
      />
    </div>
  );
}
