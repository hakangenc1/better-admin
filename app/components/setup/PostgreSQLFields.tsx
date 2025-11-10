import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "../ui/checkbox";

interface PostgreSQLFieldsProps {
  values: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    schema?: string;
    ssl?: boolean;
  };
  onChange: (field: string, value: string | number | boolean) => void;
  errors?: Record<string, string>;
}

export function PostgreSQLFields({ values, onChange, errors = {} }: PostgreSQLFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Host */}
      <div className="space-y-2">
        <Label htmlFor="host">
          Host <span className="text-destructive">*</span>
        </Label>
        <Input
          id="host"
          type="text"
          placeholder="localhost"
          value={values.host}
          onChange={(e) => onChange("host", e.target.value)}
          aria-invalid={!!errors.host}
        />
        {errors.host && (
          <p className="text-sm text-destructive">{errors.host}</p>
        )}
      </div>

      {/* Port */}
      <div className="space-y-2">
        <Label htmlFor="port">
          Port <span className="text-destructive">*</span>
        </Label>
        <Input
          id="port"
          type="number"
          placeholder="5432"
          value={values.port}
          onChange={(e) => onChange("port", parseInt(e.target.value) || 5432)}
          aria-invalid={!!errors.port}
        />
        {errors.port && (
          <p className="text-sm text-destructive">{errors.port}</p>
        )}
      </div>

      {/* Database */}
      <div className="space-y-2">
        <Label htmlFor="database">
          Database Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="database"
          type="text"
          placeholder="myapp"
          value={values.database}
          onChange={(e) => onChange("database", e.target.value)}
          aria-invalid={!!errors.database}
        />
        {errors.database && (
          <p className="text-sm text-destructive">{errors.database}</p>
        )}
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="postgres"
          value={values.username}
          onChange={(e) => onChange("username", e.target.value)}
          aria-invalid={!!errors.username}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-destructive">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => onChange("password", e.target.value)}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      {/* Schema (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="schema">
          Schema <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <Input
          id="schema"
          type="text"
          placeholder="public"
          value={values.schema || ""}
          onChange={(e) => onChange("schema", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to use the default schema
        </p>
      </div>

      {/* SSL Toggle */}
      <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
        <Checkbox
          id="ssl"
          checked={values.ssl || false}
          onCheckedChange={(checked) => onChange("ssl", checked as boolean)}
          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">
            Enable SSL/TLS connection
          </p>
          <p className="text-muted-foreground text-sm">
            Recommended for production environments
          </p>
        </div>
      </Label>
    </div>
  );
}
