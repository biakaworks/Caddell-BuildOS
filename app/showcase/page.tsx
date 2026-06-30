import { Suspense } from "react"
import { ShowcaseBuilder } from "@/components/buildos/showcase/showcase-builder"

export default function ShowcasePage() {
  return (
    <Suspense fallback={null}>
      <ShowcaseBuilder />
    </Suspense>
  )
}
