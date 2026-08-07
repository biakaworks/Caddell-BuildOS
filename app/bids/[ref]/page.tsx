import { BIDS } from "@/lib/data/fixtures"
import { BidDetail } from "@/components/buildos/bids"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  return BIDS.map((b) => ({ ref: b.ref }))
}

export default async function BidDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  const bid = BIDS.find((b) => b.ref === ref)
  if (!bid) notFound()
  return <BidDetail ref={ref} />
}
