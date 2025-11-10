import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import type { User } from "~/types";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onBan: (user: User) => void;
  onUnban: (user: User) => void;
  isLoading: boolean;
  isAdmin?: boolean;
  selectable?: boolean;
  selectedUserIds?: string[];
  onSelectChange?: (user: User, selected: boolean) => void;
  onSelectAllChange?: (selected: boolean) => void;
}

function TableSkeleton({ selectable }: { selectable: boolean }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          {selectable && (
            <TableCell>
              <Skeleton className="h-4 w-4" />
            </TableCell>
          )}
          <TableCell>
            <Skeleton className="h-4 w-[200px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[150px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[120px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState({ selectable }: { selectable: boolean }) {
  return (
    <TableRow>
      <TableCell colSpan={selectable ? 7 : 6} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-muted-foreground">No users found</p>
          <p className="text-sm text-muted-foreground">
            Get started by creating a new user
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  onBan,
  onUnban,
  isLoading,
  isAdmin = true,
  selectable = false,
  selectedUserIds = [],
  onSelectChange,
  onSelectAllChange,
}: UserTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (user: User) => {
    if (user.banned) {
      return (
        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
          Banned
        </span>
      );
    }
    if (user.emailVerified) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
        Pending
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
        User
      </span>
    );
  };

  const allSelected = selectable && users.length > 0 && users.every((user) => selectedUserIds.includes(user.id));
  const someSelected =
    selectable &&
    users.some((user) => selectedUserIds.includes(user.id)) &&
    !allSelected;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-[48px]">
                <Checkbox
                  aria-label="Select all users"
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => onSelectAllChange?.(checked === true)}
                  disabled={users.length === 0}
                />
              </TableHead>
            )}
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton selectable={selectable} />
          ) : users.length === 0 ? (
            <EmptyState selectable={selectable} />
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                {selectable && (
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${user.email}`}
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={(checked) =>
                        onSelectChange?.(user, checked === true)
                      }
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>{getStatusBadge(user)}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                      disabled={!isAdmin}
                    >
                      Edit
                    </Button>
                    {user.banned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUnban(user)}
                        className="text-green-600 hover:text-green-700"
                        disabled={!isAdmin}
                      >
                        Unban
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onBan(user)}
                        className="text-orange-600 hover:text-orange-700"
                        disabled={!isAdmin}
                      >
                        Ban
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(user)}
                      disabled={!isAdmin}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
