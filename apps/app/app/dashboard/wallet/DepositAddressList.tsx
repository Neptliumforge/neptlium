import type { CustodyAddress } from "@neptlium/lib";
import { DepositAddressCard } from "./DepositAddressCard";

export interface DepositAddressListProps {
  readonly addresses: readonly CustodyAddress[];
}

export function DepositAddressList({ addresses }: DepositAddressListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {addresses.map((address) => (
        <li key={address.id}>
          <DepositAddressCard address={address} />
        </li>
      ))}
    </ul>
  );
}
