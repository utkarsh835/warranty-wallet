import { AuthGate } from '@/components/auth-gate';
import { WarrantyForm } from '@/components/warranty-form';
export default function NewWarrantyPage(){return <AuthGate><WarrantyForm/></AuthGate>}
