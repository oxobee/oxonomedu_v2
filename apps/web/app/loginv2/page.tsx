import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LoginV2RedirectPage() {
  redirect('/login')
}
