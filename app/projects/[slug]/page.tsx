import { notFound } from "next/navigation"
import { getProject } from "@/lib/mock-data"
import { ProjectDetail } from "@/components/buildos/project-detail"

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab } = await searchParams
  const project = getProject(slug)
  if (!project) notFound()
  return <ProjectDetail project={project} initialTab={tab} />
}
