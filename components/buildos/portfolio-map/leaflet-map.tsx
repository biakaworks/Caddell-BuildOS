"use client"

import { useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ArrowUpRight, X } from "lucide-react"
import { formatCurrency, SITE_STATUS_META, type PortfolioSite } from "@/lib/mock-data"

type LeafletMapProps = {
  sites: PortfolioSite[]
  activeId: string | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
  resizeKey: string | number
  reducedMotion: boolean
}

const US_CENTER: [number, number] = [39.5, -98.35]

function makeIcon(status: PortfolioSite["status"], active: boolean) {
  return L.divIcon({
    className: "pm-pin-wrap",
    html: `<span class="pm-pin pm-pin--${status}${active ? " pm-pin--active" : ""}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -8],
  })
}

function SiteMarker({
  site,
  active,
  onSelect,
  onHover,
}: {
  site: PortfolioSite
  active: boolean
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}) {
  const icon = useMemo(() => makeIcon(site.status, active), [site.status, active])
  return (
    <Marker
      position={[site.lat, site.lng]}
      icon={icon}
      riseOnHover
      keyboard={false}
      eventHandlers={{
        mouseover: () => onHover(site.id),
        mouseout: () => onHover(null),
        click: () => onSelect(site.id),
      }}
    />
  )
}

function PopupCard({ site, onClose }: { site: PortfolioSite; onClose: () => void }) {
  const meta = SITE_STATUS_META[site.status]
  const toneClass =
    site.status === "current"
      ? "bg-primary/10 text-primary"
      : site.status === "future"
        ? "bg-warning-muted text-warning-strong"
        : site.status === "lead"
          ? "bg-muted text-muted-foreground"
          : "bg-foreground/10 text-foreground"

  return (
    <div className="w-64 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${toneClass}`}
          >
            {meta.label}
          </span>
          <h3 className="mt-1.5 text-sm font-semibold leading-snug text-foreground text-balance">
            {site.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <Row label="Location" value={`${site.city}${site.region ? ` · ${site.region}` : ""}`} />
        {site.status !== "office" && (
          <>
            <Row label="Business unit" value={site.businessUnit} />
            <Row label="Market" value={site.market} />
            <Row label="Delivery" value={site.deliveryMethod} />
            <Row label="Client" value={`${site.client}${site.clientType ? ` (${site.clientType})` : ""}`} />
            <Row label="Est. value" value={site.value != null ? formatCurrency(site.value) : "—"} />
          </>
        )}
        {site.status === "office" && <Row label="Type" value={site.market} />}
      </dl>

      {site.link ? (
        <Link
          href={site.link}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View details
          <ArrowUpRight className="size-3.5" />
        </Link>
      ) : (
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          Office location
        </p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-medium text-foreground">{value || "—"}</dd>
    </>
  )
}

// Imperatively pans to the pinned site, clears selection on empty-map clicks,
// and revalidates size when the container resizes (e.g. expand to full screen).
function MapController({
  selectedSite,
  resizeKey,
  reducedMotion,
  onMapClick,
}: {
  selectedSite: PortfolioSite | null
  resizeKey: string | number
  reducedMotion: boolean
  onMapClick: () => void
}) {
  const map = useMap()
  useMapEvent("click", onMapClick)

  useEffect(() => {
    if (!selectedSite) return
    const target: [number, number] = [selectedSite.lat, selectedSite.lng]
    const zoom = Math.max(map.getZoom(), 5)
    if (reducedMotion) map.setView(target, zoom)
    else map.flyTo(target, zoom, { duration: 0.6 })
  }, [selectedSite, map, reducedMotion])

  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 220)
    return () => clearTimeout(t)
  }, [resizeKey, map])

  return null
}

export default function LeafletMap({
  sites,
  activeId,
  selectedId,
  onSelect,
  onHover,
  resizeKey,
  reducedMotion,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeSite = activeId ? sites.find((s) => s.id === activeId) ?? null : null
  const selectedSite = selectedId ? sites.find((s) => s.id === selectedId) ?? null : null

  // Esc closes the pinned popover.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onSelect(null)
        onHover(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onSelect, onHover])

  return (
    <div ref={containerRef} className="size-full">
      <MapContainer
        center={US_CENTER}
        zoom={4}
        minZoom={2}
        worldCopyJump
        scrollWheelZoom
        className="size-full bg-muted"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sites.map((site) => (
          <SiteMarker
            key={site.id}
            site={site}
            active={site.id === activeId}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
        {activeSite && (
          <Popup
            position={[activeSite.lat, activeSite.lng]}
            closeButton={false}
            autoClose={false}
            closeOnClick={false}
            autoPan={Boolean(selectedSite && selectedSite.id === activeSite.id)}
          >
            <PopupCard site={activeSite} onClose={() => onSelect(null)} />
          </Popup>
        )}
        <MapController
          selectedSite={selectedSite}
          resizeKey={resizeKey}
          reducedMotion={reducedMotion}
          onMapClick={() => {
            onSelect(null)
            onHover(null)
          }}
        />
      </MapContainer>
    </div>
  )
}
