"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/shared/button";

export function FormSubmitButton({
  children,
  pendingLabel,
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<typeof Button> & {
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      className={className}
      variant={variant}
      disabled={pending || props.disabled}
    >
      {pending ? pendingLabel ?? `${typeof children === "string" ? children : "Saving"}...` : children}
    </Button>
  );
}
