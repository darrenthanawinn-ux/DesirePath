'use client'

import { useMemo, useRef, useState } from 'react'
import { Activity, ArrowDownRight, ArrowLeftRight, Check, ChevronDown, Clock3, Compass, Crosshair, Footprints, Layers2, MapPin, Minus, Plus, Radio, Route, ShieldCheck, Sparkles, X } from 'lucide-react'

type Mode = 'standard' | 'split' | 'desire'
type Node = { id: string; name: string; kind: string; x: number; y: number; note: string; verified: string }

const routes = [
  { name: 'Caltrain Platform 2 → Student Union', from: 'Caltrain Platform 2', to: 'Student Union', standard: '15 min', quick: '6 min', distance: '0.31 mi', detour: '0.78 mi', saved: 9 },
  { name: 'Transit Plaza → University Library', from: 'Transit Plaza', to: 'University Library', standard: '12 min', quick: '5 min', distance: '0.24 mi', detour: '0.62 mi', saved: 7 },
  { name: 'Lytton Plaza → Engineering Quad', from: 'Lytton Plaza', to: 'Engineering Quad', standard: '18 min', quick: '8 min', distance: '0.42 mi', detour: '0.91 mi', saved: 10 },
  { name: 'South Commons → Civic Block', from: 'South Commons', to: 'Civic Block', standard: '11 min', quick: '4 min', distance: '0.19 mi', detour: '0.54 mi', saved: 7 },
]
const initialNodes: Node[] = [
  { id: 'alma', name: 'Alma Pedestrian Gate', kind: 'GATE', x: 404, y: 331, note: 'Flat, step-free access · open 24 hours', verified: '2m ago by @maya_c' },
  { id: 'breezeway', name: 'Courtyard Breezeway', kind: 'ALLEY', x: 595, y: 287, note: 'Covered passage · 1.8m wide', verified: '5m ago by @eli_walks' },
  { id: 'library', name: 'Library East Stairwell', kind: 'STAIRS', x: 742, y: 414, note: 'Stairs only · elevator at west entrance', verified: '8m ago by @jules' },
  { id: 'bridge', name: 'South Quad Footbridge', kind: 'TRAIL', x: 515, y: 515, note: 'Gentle ramp · accessible route', verified: '12m ago by @sam_p' },
]

export default function Page() {
  const [mode, setMode] = useState<Mode>('desire')
  const [routeIndex, setRouteIndex] = useState(0)
  const [nodes, setNodes] = useState(initialNodes)
  const [selected, setSelected] = useState<Node | null>(null)
  const [blocked, setBlocked] = useState<string[]>([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const didDrag = useRef(false)
  const [drawing, setDrawing] = useState(false)
  const [waypoints, setWaypoints] = useState<{x:number;y:number}[]>([])
  const [customName, setCustomName] = useState('')
  const [live, setLive] = useState(false)
  const [toast, setToast] = useState('')
  const [notice, setNotice] = useState('')
  const route = routes[routeIndex]
  const saved = Math.max(2, route.saved - blocked.length * 2)
  const shortcutPath = blocked.length ? 'M 254 427 C 330 408 336 367 404 331 S 530 359 595 287 S 686 286 744 332 S 816 392 880 424' : 'M 254 427 C 319 414 347 357 404 331 S 531 350 595 287 S 690 306 744 332 S 824 385 880 424'
  const customPath = useMemo(() => waypoints.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' '), [waypoints])

  function reportBlocked(id: string) {
    setBlocked(current => current.includes(id) ? current : [...current, id])
    setNotice('Shortcut blocked · route recalculated')
    setSelected(null)
    window.setTimeout(() => setNotice(''), 3000)
  }
  function confirmOpen(node: Node) {
    setNodes(current => current.map(item => item.id === node.id ? { ...item, verified: 'just now by you' } : item))
    setBlocked(current => current.filter(id => id !== node.id))
    setSelected(null)
    setNotice('Thanks — shortcut confirmed open')
    window.setTimeout(() => setNotice(''), 2600)
  }
  function toggleLive() {
    const next = !live
    setLive(next)
    if (next) {
      setToast('Maya just verified Alma Pedestrian Gate')
      window.setTimeout(() => setToast(''), 4200)
    } else setToast('')
  }
  function mapClick(event: React.MouseEvent<SVGSVGElement>) {
    if (didDrag.current) { didDrag.current = false; return }
    if (!drawing) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 1000
    const y = ((event.clientY - rect.top) / rect.height) * 700
    setWaypoints(current => [...current, { x, y }])
  }
  function saveShortcut() {
    if (!customName.trim() || waypoints.length < 2) return
    const point = waypoints[Math.floor(waypoints.length / 2)]
    setNodes(current => [...current, { id: `custom-${Date.now()}`, name: customName.trim(), kind: 'COMMUNITY', x: point.x, y: point.y, note: 'Community-mapped shortcut · verify before use', verified: 'just mapped by you' }])
    setDrawing(false); setWaypoints([]); setCustomName('')
    setNotice('Shortcut added to the map'); window.setTimeout(() => setNotice(''), 2600)
  }

  return (
    <main className="app-shell">
      <div className="map-grid" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#map" aria-label="DesirePath home"><span className="brand-mark"><Route size={17} /></span><span>desire<span className="brand-light">path</span></span><span className="brand-beta">BETA</span></a>
        <div className="route-picker-wrap">
          <button className="route-picker" onClick={() => setRouteIndex((routeIndex + 1) % routes.length)} aria-label="Change route"><span className="route-icon"><ArrowLeftRight size={15}/></span><span>{route.name}</span><ChevronDown size={14} className="subtle" /></button>
        </div>
        <div className="top-actions">
          <button className={`top-action ${drawing ? 'active' : ''}`} onClick={() => { setDrawing(!drawing); setWaypoints([]); setSelected(null) }}><Plus size={15}/><span>{drawing ? 'Exit drawing' : 'Map a shortcut'}</span></button>
          <button className={`live-button ${live ? 'is-live' : ''}`} onClick={toggleLive}><span className="live-dot"/><span>{live ? 'Live feed on' : 'Simulate live feed'}</span></button>
          <button className="avatar" aria-label="Profile: Alex">A</button>
        </div>
      </header>

      <section className="map-stage" id="map" aria-label="Interactive DesirePath map">
        <div className="map-canvas" onWheel={e => { e.preventDefault(); setZoom(z => Math.max(.8, Math.min(1.6, z + (e.deltaY < 0 ? .08 : -.08)))) }}>
          <svg className="map-svg" viewBox="0 0 1000 700" role="img" aria-label={`Map showing route from ${route.from} to ${route.to}`} onClick={mapClick} onPointerDown={event => { if (drawing) return; dragStart.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerMove={event => { if (!dragStart.current) return; const dx = event.clientX - dragStart.current.x; const dy = event.clientY - dragStart.current.y; if (Math.abs(dx) + Math.abs(dy) > 4) didDrag.current = true; setPan({ x: dragStart.current.panX + dx * 1000 / event.currentTarget.clientWidth, y: dragStart.current.panY + dy * 700 / event.currentTarget.clientHeight }) }} onPointerUp={() => { dragStart.current = null }} onPointerCancel={() => { dragStart.current = null }}>
            <defs>
              <pattern id="fine-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#26303c" strokeWidth=".6" opacity=".35"/></pattern>
              <filter id="green-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="pin-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <g transform={`translate(${500 - 500 * zoom + pan.x} ${350 - 350 * zoom + pan.y}) scale(${zoom})`}>
              <rect width="1000" height="700" fill="#0b1017"/><rect width="1000" height="700" fill="url(#fine-grid)"/>
              <path d="M0 95H1000 M0 224H1000 M0 555H1000 M140 0V700 M350 0V700 M670 0V700 M875 0V700" stroke="#222d3a" strokeWidth="15" opacity=".78" fill="none"/>
              <path d="M0 95H1000 M0 224H1000 M0 555H1000 M140 0V700 M350 0V700 M670 0V700 M875 0V700" stroke="#687482" strokeWidth=".8" opacity=".42" fill="none"/>
              <path d="M68 0V700 M84 0V700" stroke="#7f6470" strokeWidth="2" opacity=".65"/><path d="M58 0V700 M94 0V700" stroke="#87909a" strokeWidth="1" strokeDasharray="8 7" opacity=".4"/>
              <text x="42" y="165" className="map-label small">CALTRAIN</text><text x="39" y="184" className="map-label tiny">PENINSULA CORRIDOR</text>
              <path d="M375 264h119v73H375z M514 246h87v59h-87z M618 245h96v91h-96z M727 254h99v65h-99z M384 367h74v89h-74z M475 367h110v61H475z M606 349h104v78H606z M726 346h112v99H726z M370 477h112v58H370z M499 462h93v98h-93z M604 453h89v86h-89z M718 465h114v68H718z" fill="#111923" stroke="#263240" strokeWidth="1.2"/>
              <path d="M511 311h88v23h-88z M459 401h18v31h-18z M694 376h20v30h-20z M802 319h20v28h-20z" fill="#0b1f1a" stroke="#183d31" strokeWidth="1"/>
              <path d="M300 286l65-28 18 45-63 27z M295 467l65-4 7 67-64 9z M839 226l89 7-3 54-86-8z M846 477l88-8 9 70-91 7z M177 250h97v62h-97z M178 344h92v84h-92z M179 453h94v85h-94z" fill="#141c26" stroke="#273342" strokeWidth="1.2"/>
              <path d="M175 208h126v25H175z M724 174h126v25H724z M373 583h192v15H373z M713 582h145v15H713z" fill="#12231e" stroke="#204337" strokeWidth="1"/>
              <text x="408" y="290" className="map-label building">STUDENT UNION</text><text x="625" y="297" className="map-label building">GREEN LIBRARY</text><text x="734" y="390" className="map-label building">ENGINEERING</text><text x="494" y="507" className="map-label building">SOUTH QUAD</text><text x="184" y="280" className="map-label building">TRANSIT PLAZA</text>
              <text x="402" y="214" className="map-label street">UNIVERSITY AVE</text><text x="740" y="213" className="map-label street">PALM DRIVE</text><text x="369" y="622" className="map-label street">CAMPUS DRIVE</text><text x="114" y="490" className="map-label street" transform="rotate(-90 114 490)">ALMA STREET</text><text x="890" y="200" className="map-label street" transform="rotate(90 890 200)">LASUEN STREET</text>
              <path d="M175 571c34-19 78-20 117-6 35 12 59 39 96 38 42-1 64-24 102-21 35 3 52 25 85 23 42-2 68-25 105-16 38 8 55 25 91 20" fill="none" stroke="#25483b" strokeWidth="3" strokeDasharray="2 7" opacity=".8"/>
              <path d="M255 427 C 293 427 312 427 350 427 S 374 428 404 427 S 456 428 493 427 S 530 428 559 427 S 613 428 649 427 S 710 428 746 427 S 826 427 880 424" fill="none" stroke="#596473" strokeWidth="3" strokeDasharray="8 8" opacity={mode === 'desire' ? .58 : .95}/>
              <path d={shortcutPath} fill="none" stroke="#10b981" strokeWidth={mode === 'standard' ? 0 : 3} opacity={mode === 'standard' ? 0 : .36} filter="url(#green-glow)"/>
              {mode !== 'standard' && <path d={shortcutPath} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 1" pathLength="1" className="flow-path" filter="url(#green-glow)"/>}
              {mode === 'split' && <path d={shortcutPath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 8" opacity=".6"/>}
              {drawing && customPath && <path d={customPath} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#pin-glow)"/>}
              {drawing && waypoints.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5"/>)}
              <g className="route-endpoint"><circle cx="254" cy="427" r="15" fill="#10b981" opacity=".13" className="pulse-ring"/><circle cx="254" cy="427" r="7" fill="#10b981" stroke="#d1fae5" strokeWidth="2"/><rect x="221" y="390" width="65" height="20" rx="6" fill="#0d1718" stroke="#1d473a"/><text x="253" y="404" textAnchor="middle" className="endpoint-label">START</text></g>
              <g className="route-endpoint"><circle cx="880" cy="424" r="15" fill="#a78bfa" opacity=".13" className="pulse-ring delay"/><circle cx="880" cy="424" r="7" fill="#a78bfa" stroke="#ede9fe" strokeWidth="2"/><rect x="849" y="387" width="61" height="20" rx="6" fill="#171522" stroke="#403268"/><text x="879" y="401" textAnchor="middle" className="endpoint-label">END</text></g>
              {nodes.map(node => <g key={node.id} className="map-node" onClick={e => {e.stopPropagation();setSelected(node)}} role="button" aria-label={`Inspect ${node.name}`} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(node)}}}>
                <circle cx={node.x} cy={node.y} r="16" fill={blocked.includes(node.id)?'#ef4444':'#10b981'} opacity=".14" className={live?'pulse-ring':''}/><circle cx={node.x} cy={node.y} r="8" fill={blocked.includes(node.id)?'#ef4444':'#09120f'} stroke={blocked.includes(node.id)?'#f87171':'#34d399'} strokeWidth="2" filter="url(#pin-glow)"/><circle cx={node.x} cy={node.y} r="2.5" fill={blocked.includes(node.id)?'#fecaca':'#a7f3d0'}/>
              </g>)}
              <g transform="translate(940 80)"><path d="M0 20L8 0l8 20-8-5z" fill="#8995a5"/><text x="8" y="34" textAnchor="middle" className="map-label tiny">N</text></g>
            </g>
          </svg>
          <div className="map-vignette" />
          <div className="map-left-rail">
            <div className="live-status"><span className="status-dot"/><span>COMMUNITY MAP</span><span className="status-sep">·</span><span>LIVE</span></div>
            <p className="map-context">Palo Alto <span>·</span> Stanford district</p>
          </div>
          <div className="mode-switch" role="group" aria-label="Route display mode">
            {(['standard','split','desire'] as Mode[]).map((item)=><button key={item} className={mode===item?'selected':''} onClick={()=>setMode(item)}>{item==='standard'?'Standard Maps':item==='split'?'Split Compare':'DesirePath Mode'}</button>)}
          </div>
          <div className="map-tools"><button onClick={()=>setZoom(z=>Math.min(1.6,z+.12))} aria-label="Zoom in"><Plus size={16}/></button><button onClick={()=>setZoom(z=>Math.max(.8,z-.12))} aria-label="Zoom out"><Minus size={16}/></button><span/><button onClick={()=>setZoom(1)} aria-label="Reset map view"><Crosshair size={15}/></button></div>
          <div className="scale-indicator"><span/> 500 ft</div>
          {drawing && <div className="drawing-card glass-card"><div className="drawing-head"><span className="amber-icon"><Sparkles size={15}/></span><div><b>Map a shortcut</b><p>Click at least 2 points on the map</p></div><button onClick={()=>{setDrawing(false);setWaypoints([])}} aria-label="Close drawing mode"><X size={16}/></button></div><input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="Name this shortcut" aria-label="Shortcut name"/><div className="drawing-foot"><span>{waypoints.length} waypoints</span><button disabled={waypoints.length<2||!customName.trim()} onClick={saveShortcut}>Save path <ArrowDownRight size={14}/></button></div></div>}
          {selected && <div className="node-inspector glass-card" role="dialog" aria-label={`${selected.name} details`}><button className="close-inspector" onClick={()=>setSelected(null)} aria-label="Close details"><X size={15}/></button><span className="node-kind"><MapPin size={12}/>{selected.kind}</span><h3>{selected.name}</h3><div className="verified-line"><ShieldCheck size={14}/><span>Verified {selected.verified}</span></div><p className="access-note">{selected.note}</p><div className="inspector-actions"><button className="confirm-button" onClick={()=>confirmOpen(selected)}><Check size={14}/> Confirm open</button><button className="blocked-button" onClick={()=>reportBlocked(selected.id)}>Report blocked</button></div></div>}
          {toast && <div className="feed-toast glass-card"><span className="toast-avatar">m</span><div><strong>Shortcut verified</strong><p>{toast}</p><small>JUST NOW · COMMUNITY UPDATE</small></div><button aria-label="Dismiss notification" onClick={()=>setToast('')}><X size={14}/></button></div>}
          {notice && <div className="notice-toast"><Check size={15}/>{notice}</div>}
        </div>

        <aside className="side-panel">
          <div className="panel-header"><div className="eyebrow"><span className="eyebrow-icon"><Compass size={14}/></span> YOUR WALK</div><button className="more-button" aria-label="Map layers"><Layers2 size={16}/></button></div>
          <div className="destination-block"><span className="destination-caption">FASTEST WALKING ROUTE</span><h1>{route.to}</h1><p>from <span>{route.from}</span></p></div>
          <div className="route-hero"><div className="hero-top"><span className="hero-kicker"><span className="hero-live-dot"/>DESIREPATH ROUTE</span><span className="verified-tag"><ShieldCheck size={12}/> verified</span></div><div className="hero-metrics"><strong>{route.quick}</strong><span className="metric-divider"/><div><b>{route.distance}</b><small>WALKING DISTANCE</small></div></div><div className="time-comparison"><span><Clock3 size={13}/> Standard route <del>{route.standard}</del></span><span className="savings">−{saved} min <ArrowDownRight size={13}/></span></div><div className="route-progress"><span style={{width:`${Math.min(82, 51 + blocked.length * 8)}%`}}/></div><div className="route-foot"><span><Footprints size={13}/> {Math.round(saved*112)} steps saved</span><span><Activity size={13}/> Updated just now</span></div></div>
          <div className="comparison-card"><div className="comparison-title"><span>THE DIFFERENCE</span><span className="compare-badge">−{saved} MIN</span></div><div className="compare-columns"><div><span className="compare-label">STANDARD MAPS</span><b>{route.standard}</b><small>{route.detour}</small></div><div className="compare-arrow"><ArrowLeftRight size={15}/></div><div><span className="compare-label green-text">DESIREPATH</span><b className="green-text">{route.quick}</b><small>{route.distance}</small></div></div><div className="steps-saved"><Footprints size={14}/><span><b>{Math.round(saved*112)}</b> steps not taken</span><span className="steps-saved-right">LESS DETOUR, MORE DAY</span></div></div>
          <div className="shortcut-section"><div className="section-title"><span>SHORTCUTS ON ROUTE</span><span className="count-pill">{nodes.length}</span><button aria-label="More shortcut options"><ChevronDown size={14}/></button></div><div className="shortcut-list">{nodes.slice(0,3).map(node=><button key={node.id} className="shortcut-row" onClick={()=>setSelected(node)}><span className={`shortcut-marker ${blocked.includes(node.id)?'blocked':''}`}><MapPin size={14}/></span><span className="shortcut-copy"><b>{node.name}</b><small><span className={blocked.includes(node.id)?'red-text':'verified-mini'}>{blocked.includes(node.id)?'REPORTED BLOCKED':'● VERIFIED'}</span><span> · {node.kind}</span></small></span><span className="row-chevron">›</span></button>)}</div></div>
          <div className="panel-bottom"><div className="community-avatars"><i>m</i><i>e</i><i>j</i><span>+8</span></div><div><b>12 walkers nearby</b><small>Last community check 2 min ago</small></div><button className="refresh-button" aria-label="Refresh map"><Radio size={15}/></button></div>
        </aside>
        {mode === 'split' && <div className="split-label"><span>BEFORE</span><i/><span>AFTER</span></div>}
        <div className="map-attribution">DESIREPATH <span>·</span> COMMUNITY-MAPPED WALKING NETWORK</div>
      </section>
      <footer className="app-footer"><span><span className="footer-pulse"/> 4 shortcuts verified today</span><span className="footer-center">Maps should follow people, not just roads.</span><span>Peninsula, CA <span className="status-sep">·</span> <button onClick={()=>setNotice('Map data refreshed just now')}>Refresh map</button></span></footer>
    </main>
  )
}
