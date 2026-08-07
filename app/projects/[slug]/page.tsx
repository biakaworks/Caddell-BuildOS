import { notFound } from "next/navigation"
import { PROJECTS } from "@/lib/data/fixtures"
import { ProjectDetail } from "@/components/buildos/project-detail"

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.id }))
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = PROJECTS.find((p) => p.id === slug)
  if (!project) notFound()
  return <ProjectDetail project={project} />
}
