import { KnowledgeView } from "@/components/buildos/knowledge"

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return <KnowledgeView initialQuery={q} />
}
