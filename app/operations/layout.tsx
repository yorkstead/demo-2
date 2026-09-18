import { ReactNode } from "react";
import { OperationsShell } from "@/components/operations/OperationsShell";

export default function Layout({ children }: { children: ReactNode }) {
  return <OperationsShell>{children}</OperationsShell>;
}
