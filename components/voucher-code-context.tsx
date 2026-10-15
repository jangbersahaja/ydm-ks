"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type VoucherCodeContextValue = {
  voucherCode: string;
  setVoucherCode: Dispatch<SetStateAction<string>>;
  // Member query once it is ready to look up, otherwise empty.
  memberQuery: string;
  setMemberQuery: Dispatch<SetStateAction<string>>;
  // True while the entered voucher is not usable, so the purchase cannot be submitted.
  voucherBlocked: boolean;
  setVoucherBlocked: Dispatch<SetStateAction<boolean>>;
};

const VoucherCodeContext = createContext<VoucherCodeContextValue | null>(null);

export function VoucherCodeProvider({ children }: { children: ReactNode }) {
  const [voucherCode, setVoucherCode] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [voucherBlocked, setVoucherBlocked] = useState(false);
  return (
    <VoucherCodeContext.Provider
      value={{
        voucherCode,
        setVoucherCode,
        memberQuery,
        setMemberQuery,
        voucherBlocked,
        setVoucherBlocked,
      }}
    >
      {children}
    </VoucherCodeContext.Provider>
  );
}

export function useVoucherCode() {
  const context = useContext(VoucherCodeContext);
  if (!context) {
    throw new Error("useVoucherCode must be used inside VoucherCodeProvider");
  }
  return context;
}
