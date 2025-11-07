import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import type { Route } from "./+types/dashboard.users";
import { useUsers } from "~/contexts/UserContext";
import { UserTable } from "~/components/users/UserTable";
import { UserCreateDialog } from "~/components/users/UserCreateDialog";
import { UserEditDialog } from "~/components/users/UserEditDialog";
import { UserDeleteDialog } from "~/components/users/UserDeleteDialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import type { User } from "~/types";

interface DashboardContext {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Management - Dashboard" },
    { name: "description", content: "Manage users in the system" },
  ];
}

export default function DashboardUsers() {
  const { user } = useOutletContext<DashboardContext>();
  const { users, isLoading, error, fetchUsers } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handleCreateSuccess = () => {
    toast.success("User created successfully");
    fetchUsers();
  };

  const handleEditSuccess = () => {
    toast.success("User updated successfully");
    fetchUsers();
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  const handleDeleteSuccess = () => {
    toast.success("User deleted successfully");
    fetchUsers();
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and monitor all users in the system
          </p>
        </div>
        <Button onClick={handleCreateUser} size="default">
          Create User
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/50 p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-destructive">
                Error loading users
              </h3>
              <p className="mt-1 text-sm text-destructive/90">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* User Table */}
      <UserTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

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
    </div>
  );
}
