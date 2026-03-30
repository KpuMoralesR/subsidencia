#!/usr/bin/env python3
"""
===============================================================================
MEXICO VALLEY BASIN — TRANSECT GENERATOR
===============================================================================

VERSION: 1.0

Generates geological cross-section transects from .lth well data files.
Uses correct segment-based geometry for well-to-transect distance and
projection, including full KML polyline support.

OUTPUTS:
  1. Map view  — spatial distribution of wells relative to the transect,
                 with buffer zone and projection lines.
  2. Profile   — perpendicular offset (left/right) vs. distance along transect.
  3. Cross-section — lithological / geophysical column plot with full symbology.

COORDINATE SYSTEMS:
  - UTM Zone 14N (default)
  - Geographic WGS84 (decimal degrees)

USAGE — two-point transect (geographic):
  python transect_generator.py -i Totalok.lth -s --coords geo \\
      --lat1 19.3035 --lon1 -99.1499 \\
      --lat2 19.3622 --lon2 -99.1432 \\
      --name MyTransect --buffer 2000

USAGE — two-point transect (UTM):
  python transect_generator.py -i Totalok.lth -s --coords utm \\
      --x1 485000 --y1 2135000 --x2 490000 --y2 2140000 \\
      --name MyTransect --buffer 1000

USAGE — KML polyline:
  python transect_generator.py -i Totalok.lth -s --kml my_transect.kml \\
      --buffer 2000 --name MyTransect

REQUIREMENTS: numpy pandas matplotlib seaborn openpyxl
===============================================================================
"""

import argparse
import sys
import os
import re
import math
import xml.etree.ElementTree as ET
from math import pi, sin, cos, tan, sqrt, radians, degrees
from typing import List, Tuple, Dict, Optional

import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Rectangle, Polygon
from matplotlib.lines import Line2D
import matplotlib.gridspec as gridspec
import matplotlib.patheffects as pe

plt.style.use('seaborn-v0_8-darkgrid')

# ============================================================================
# SYMBOLOGY
# ============================================================================

MATERIAL_COLORS = {
    'ARCILLA':      '#FFFFC0',
    'ARENA':        '#BFFFFF',
    'GRAVA':        '#D2B48C',
    'BASALTO':      '#FFFFFF',
    'ANDESITA':     '#FFBFBF',
    'TOBA':         '#DEB887',
    'CONGLOMERADO': '#A0522D',
    'TEZO':         '#CD853F',
    'CENIZA':       '#F5DEB3',
    'ARCILLAA':     '#FFFFC0',
    'ARENAA':       '#BFFFFF',
    'GRAVAA':       '#BC8F8F',
    'ARENACGR':     '#BFFFFF',
    'ARENAF':       '#BFFFFF',
    'CALIZA':       '#7FFFFF',
    'C1':           '#FFFFC0',
    'C2':           '#FFFFC0',
    'C3':           '#BFFFFF',
    'C4':           '#FFFFFF',
    'C5':           '#FFBFBF',
    'UGE1':         '#FFFFC0',
    'UGE2':         '#BFFFFF',
    'UGE3':         '#FFBFBF',
    'UGE':          '#D3D3D3',
    'NAF':          '#0000FF',
}

MATERIAL_PATTERNS = {
    'C1':   '///',
    'C2':   '\\\\\\',
    'C3':   '...',
    'C4':   None,
    'C5':   '---',
    'UGE1': '///',
    'UGE2': '...',
    'UGE3': None,
}

WELL_TYPE_COLORS = {
    'TRS (Seismic)':          '#A23B72',
    'SEV/RGP (Resistivity)':  '#F18F01',
    'Lithological':            '#2E86AB',
    'RGP (Water Table)':       '#C73E1D',
    'Unknown':                 '#6C757D',
}


# ============================================================================
# COORDINATE CONVERSION
# ============================================================================

def latlon_to_utm(lat: float, lon: float, zone: int = 14) -> Tuple[float, float]:
    """Convert WGS84 Lat/Lon to UTM (Zone 14N for Mexico City)."""
    a  = 6378137.0
    e  = 0.081819191
    k0 = 0.9996

    lat_rad  = math.radians(lat)
    lon_rad  = math.radians(lon)
    lon0_rad = math.radians((zone - 1) * 6 - 180 + 3)

    N = a / math.sqrt(1 - e**2 * math.sin(lat_rad)**2)
    T = math.tan(lat_rad)**2
    C = (e**2 / (1 - e**2)) * math.cos(lat_rad)**2
    A = (lon_rad - lon0_rad) * math.cos(lat_rad)

    M = a * (
        (1 - e**2/4 - 3*e**4/64 - 5*e**6/256)   * lat_rad
      - (3*e**2/8 + 3*e**4/32  + 45*e**6/1024)  * math.sin(2*lat_rad)
      + (15*e**4/256 + 45*e**6/1024)             * math.sin(4*lat_rad)
      - (35*e**6/3072)                            * math.sin(6*lat_rad)
    )

    easting  = k0 * N * (A + (1-T+C)*A**3/6 +
                         (5-18*T+T**2+72*C-58*e**2)*A**5/120) + 500000.0
    northing = k0 * (M + N*math.tan(lat_rad) *
                     (A**2/2 + (5-T+9*C+4*C**2)*A**4/24 +
                      (61-58*T+T**2+600*C-330*e**2)*A**6/720))
    return easting, northing


def utm_to_latlon(easting: float, northing: float,
                  zone: int = 14, northern: bool = True) -> Tuple[float, float]:
    """Convert UTM to WGS84 Lat/Lon."""
    a  = 6378137.0
    e  = 0.081819191
    k0 = 0.9996
    E0 = 500000.0
    N0 = 0.0 if northern else 10000000.0

    x = easting  - E0
    y = northing - N0
    M = y / k0
    mu = M / (a * (1 - e**2/4 - 3*e**4/64 - 5*e**6/256))
    e1 = (1 - math.sqrt(1-e**2)) / (1 + math.sqrt(1-e**2))

    phi1 = (mu
            + (3*e1/2   - 27*e1**3/32) * math.sin(2*mu)
            + (21*e1**2/16 - 55*e1**4/32) * math.sin(4*mu)
            + (151*e1**3/96) * math.sin(6*mu))

    C1 = e**2 * math.cos(phi1)**2 / (1 - e**2)
    T1 = math.tan(phi1)**2
    N1 = a / math.sqrt(1 - e**2 * math.sin(phi1)**2)
    R1 = a * (1 - e**2) / (1 - e**2 * math.sin(phi1)**2)**1.5
    D  = x / (N1 * k0)

    lat = phi1 - (N1 * math.tan(phi1) / R1) * (
        D**2/2
        - (5 + 3*T1 + 10*C1 - 4*C1**2 - 9*e**2) * D**4/24
        + (61 + 90*T1 + 298*C1 + 45*T1**2 - 252*e**2 - 3*C1**2) * D**6/720
    )
    lon0 = math.radians((zone - 1) * 6 - 180 + 3)
    lon  = (D - (1+2*T1+C1)*D**3/6 +
            (5-2*C1+28*T1-3*C1**2+8*e**2+24*T1**2)*D**5/120) / math.cos(phi1)

    return math.degrees(lat), math.degrees(lon) + math.degrees(lon0)


# ============================================================================
# GEOMETRY HELPERS
# ============================================================================

class Point:
    """Simple 2-D point with optional metadata."""
    def __init__(self, x: float, y: float,
                 well_id: str = None, well_type: str = None,
                 elevation: float = None):
        self.x         = x
        self.y         = y
        self.well_id   = well_id
        self.well_type = well_type
        self.elevation = elevation

    def __repr__(self):
        return f"{self.well_id}({self.x:.0f},{self.y:.0f})"


def _vec(p1: Point, p2: Point) -> Tuple[float, float]:
    return (p2.x - p1.x, p2.y - p1.y)


def _dot(v1, v2) -> float:
    return v1[0]*v2[0] + v1[1]*v2[1]


def _cross_z(v1, v2) -> float:
    return v1[0]*v2[1] - v1[1]*v2[0]


def _dist(p1: Point, p2: Point) -> float:
    return math.hypot(p2.x - p1.x, p2.y - p1.y)


def project_point_to_segment(point: Point,
                              seg_start: Point,
                              seg_end: Point) -> Dict:
    """
    Project a point onto a finite line segment.

    Correctly handles points that fall beyond either endpoint by
    clamping the projection parameter t to [0, seg_length].

    Returns
    -------
    dict with keys:
        proj_point   – projected Point on segment
        dist_to_line – minimum distance from point to segment
        dist_along   – distance from seg_start to projection (clamped)
        side         – +1 (right), -1 (left), 0 (on line)
        at_start     – True if projection fell on or before start
        at_end       – True if projection fell on or after end
    """
    seg_vec    = _vec(seg_start, seg_end)
    seg_length = math.hypot(*seg_vec)

    if seg_length == 0:
        d = _dist(point, seg_start)
        return dict(proj_point=Point(seg_start.x, seg_start.y),
                    dist_to_line=d, dist_along=0,
                    side=0, at_start=True, at_end=True)

    seg_unit  = (seg_vec[0]/seg_length, seg_vec[1]/seg_length)
    point_vec = _vec(seg_start, point)

    t         = _dot(point_vec, seg_unit)
    t_clamped = max(0.0, min(t, seg_length))

    proj = Point(seg_start.x + t_clamped * seg_unit[0],
                 seg_start.y + t_clamped * seg_unit[1])

    if t < 0:
        dist = _dist(point, seg_start)
    elif t > seg_length:
        dist = _dist(point, seg_end)
    else:
        dist = abs(_cross_z(seg_vec, point_vec)) / seg_length

    cross_signed = _cross_z(seg_vec, point_vec)
    side = 1 if cross_signed > 1e-10 else (-1 if cross_signed < -1e-10 else 0)

    return dict(proj_point=proj,
                dist_to_line=dist,
                dist_along=t_clamped,
                side=side,
                at_start=(t_clamped == 0),
                at_end=(t_clamped == seg_length))


def project_point_to_polyline(point: Point,
                               polyline: List[Point]) -> Dict:
    """
    Project a point onto a multi-segment polyline.

    Finds the closest segment, then returns the cumulative distance
    along the entire polyline to the projection.

    Returns
    -------
    dict with same keys as project_point_to_segment, plus:
        segment_index – index of the closest segment
    """
    if len(polyline) < 2:
        raise ValueError("Polyline must have at least 2 vertices.")

    cum_dist = [0.0]
    for i in range(len(polyline) - 1):
        cum_dist.append(cum_dist[-1] + _dist(polyline[i], polyline[i+1]))
    total_length = cum_dist[-1]

    best, min_d = None, float('inf')
    for i in range(len(polyline) - 1):
        r = project_point_to_segment(point, polyline[i], polyline[i+1])
        if r['dist_to_line'] < min_d:
            min_d = r['dist_to_line']
            best  = dict(
                proj_point  = r['proj_point'],
                dist_to_line= r['dist_to_line'],
                dist_along  = cum_dist[i] + r['dist_along'],
                side        = r['side'],
                at_start    = (cum_dist[i] + r['dist_along'] == 0),
                at_end      = (cum_dist[i] + r['dist_along'] == total_length),
                segment_index = i,
            )
    return best


# ============================================================================
# KML PARSER
# ============================================================================

def parse_kml(kml_file: str) -> Tuple[List[Tuple[float, float]], str]:
    """Parse a KML file and return all UTM vertices of the first LineString."""
    try:
        tree = ET.parse(kml_file)
        root = tree.getroot()
        ns   = {'kml': 'http://www.opengis.net/kml/2.2'}

        placemark = root.find('.//kml:Placemark', ns)
        if placemark is None:
            raise ValueError("No Placemark found in KML.")

        name_elem = placemark.find('kml:name', ns)
        kml_name  = (name_elem.text if name_elem is not None
                     else os.path.splitext(os.path.basename(kml_file))[0])

        coords_elem = placemark.find('.//kml:coordinates', ns)
        if coords_elem is None or not coords_elem.text:
            raise ValueError("No coordinates found in KML.")

        utm_points, geo_points = [], []
        for token in coords_elem.text.strip().split():
            parts = token.split(',')
            if len(parts) < 2:
                continue
            lon, lat = float(parts[0]), float(parts[1])
            geo_points.append((lat, lon))
            utm_points.append(latlon_to_utm(lat, lon))

        if len(utm_points) < 2:
            raise ValueError("KML line must have at least 2 vertices.")

        print(f"  KML '{kml_name}': {len(utm_points)} vertices")
        return utm_points, kml_name

    except ET.ParseError:
        raise ValueError(f"Cannot parse KML file: {kml_file}")


# ============================================================================
# .lth PARSER
# ============================================================================

def _layer_type(material: str) -> str:
    """Classify a single lithology record's type from its material string."""
    if 'V=' in material or (re.match(r'^C\d', material) and 'V' in material):
        return 'TRS (Seismic)'
    if 'UGE' in material and ('R=' in material or 'OHM-M' in material):
        return 'SEV/RGP (Resistivity)'
    if 'NAF' in material:
        return 'RGP (Water Table)'
    return 'Lithological'


def _classify_well_type(lith: list) -> str:
    """
    Classify the overall well type by scanning all lith records.
    Priority: Seismic > Resistivity > Water Table > Lithological.
    """
    types = {l['layer_type'] for l in lith}
    if 'TRS (Seismic)'         in types: return 'TRS (Seismic)'
    if 'SEV/RGP (Resistivity)' in types: return 'SEV/RGP (Resistivity)'
    if 'RGP (Water Table)'     in types: return 'RGP (Water Table)'
    return 'Lithological'


def _extract_resistivity(s: str) -> Optional[float]:
    m = re.search(r'R[=:]?\s*(\d+\.?\d*)', s)
    return float(m.group(1)) if m else None


def _extract_velocity(s: str) -> Optional[float]:
    m = re.search(r'V\d*[=:]?\s*(\d+\.?\d*)', s)
    return float(m.group(1)) if m else None


def _classify_uge(r: Optional[float]) -> Optional[str]:
    if r is None:
        return None
    if r <= 17:
        return 'UGE1'
    elif r <= 473:
        return 'UGE2'
    return 'UGE3'


def parse_lth(filepath: str) -> Tuple[List[Point], pd.DataFrame]:
    """
    Parse a .lth well-data file.

    Returns
    -------
    well_points : list of Point
        One Point per well that has coordinates.
    df : pd.DataFrame
        Full lithological record table.
    """
    wells = []
    current = None
    records = []

    with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
        lines = fh.readlines()

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        if line.startswith('WELL:'):
            if current and current.get('lith'):
                wells.append(current)
            current = {'name': line.split('WELL:')[1].strip(),
                       'x': None, 'y': None, 'elev': None, 'lith': []}

        elif line.startswith('X:') and current:
            try:
                current['x'] = float(line.split('X:')[1].strip())
            except Exception:
                pass

        elif line.startswith('Y:') and current:
            try:
                current['y'] = float(line.split('Y:')[1].strip())
            except Exception:
                pass

        elif line.startswith('ELEV:') and current:
            try:
                current['elev'] = float(line.split('ELEV:')[1].strip())
            except Exception:
                pass

        elif line.startswith('LITH:') and current:
            i += 1
            while i < len(lines):
                ll = lines[i].strip()
                if ll.startswith('WELL:') or not ll:
                    i -= 1
                    break
                try:
                    parts = ll.split(None, 1)
                    if len(parts) >= 2:
                        mat = parts[1].strip()
                        current['lith'].append({
                            'depth':      float(parts[0]),
                            'material':   mat,
                            'layer_type': _layer_type(mat),
                        })
                except Exception:
                    pass
                i += 1

        i += 1

    if current and current.get('lith'):
        wells.append(current)

    # Build point list and record table
    well_points = []
    for w in wells:
        well_type = _classify_well_type(w['lith'])
        if w['x'] is not None and w['y'] is not None:
            well_points.append(Point(
                x=w['x'], y=w['y'],
                well_id=w['name'],
                well_type=well_type,
                elevation=w['elev']
            ))
        for lith in w['lith']:
            records.append({
                'well_name':   w['name'],
                'x':           w['x'],
                'y':           w['y'],
                'elevation':   w['elev'],
                'depth':       lith['depth'],
                'material':    lith['material'],
                'well_type':   well_type,
                'resistivity': _extract_resistivity(lith['material']),
                'velocity':    _extract_velocity(lith['material']),
            })

    df = pd.DataFrame(records)
    if not df.empty:
        df['uge_class'] = df['resistivity'].apply(_classify_uge)

    print(f"  Parsed {len(wells)} wells, {len(well_points)} with coordinates, "
          f"{len(df)} lithology records")
    return well_points, df


# ============================================================================
# TRANSECT ANALYZER
# ============================================================================

class TransectAnalyzer:
    """
    Projects wells onto a transect line (two-point or KML polyline),
    filters by buffer distance using correct segment geometry,
    and generates three output figures:
      1. Map view
      2. Offset profile
      3. Geological cross-section with full symbology
    """

    def __init__(self, input_file: str, output_dir: str = 'transect_output'):
        self.input_file = input_file
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

        print(f"\nLoading: {input_file}")
        self.well_points, self.df = parse_lth(input_file)

        # Set by set_transect_*
        self.transect_name  = None
        self.is_polyline    = False
        self.polyline_pts   = []
        self.line_start     = None
        self.line_end       = None
        self.line_length    = 0.0
        self.buffer         = 1000.0
        self.coord_system   = 'utm'
        self.start_geo      = None
        self.end_geo        = None

        # Set by analyze()
        self.results        = None          # wells within buffer
        self.all_in_view    = None          # all wells in map extent

    # ------------------------------------------------------------------
    # TRANSECT DEFINITION
    # ------------------------------------------------------------------

    def set_transect_from_points(self, coord1: Tuple, coord2: Tuple,
                                 coord_system: str = 'utm',
                                 name: str = 'Transect',
                                 buffer: float = 1000.0):
        """Define the transect from two coordinate pairs."""
        self.buffer       = buffer
        self.coord_system = coord_system
        self.transect_name = name
        self.is_polyline  = False

        if coord_system == 'geo':
            lat1, lon1 = coord1
            lat2, lon2 = coord2
            x1, y1 = latlon_to_utm(lat1, lon1)
            x2, y2 = latlon_to_utm(lat2, lon2)
            self.start_geo = coord1
            self.end_geo   = coord2
            print(f"\nTransect: {name}  [{coord_system.upper()}]")
            print(f"  Start : ({lat1:.6f}°, {lon1:.6f}°)  →  UTM ({x1:.0f}, {y1:.0f})")
            print(f"  End   : ({lat2:.6f}°, {lon2:.6f}°)  →  UTM ({x2:.0f}, {y2:.0f})")
        else:
            x1, y1 = coord1
            x2, y2 = coord2
            self.start_geo = self.end_geo = None
            print(f"\nTransect: {name}  [{coord_system.upper()}]")
            print(f"  Start : ({x1:.0f}, {y1:.0f})")
            print(f"  End   : ({x2:.0f}, {y2:.0f})")

        self.line_start  = Point(x1, y1, 'START')
        self.line_end    = Point(x2, y2, 'END')
        self.line_length = _dist(self.line_start, self.line_end)

        az = math.degrees(math.atan2(x2 - x1, y2 - y1)) % 360
        print(f"  Length: {self.line_length:.0f} m  |  Azimuth: {az:.1f}°  |  Buffer: {buffer:.0f} m")

    def set_transect_from_kml(self, kml_file: str, buffer: float = 1000.0,
                              name: str = None, reverse: bool = False):
        """Define the transect from a KML polyline file."""
        self.buffer = buffer
        utm_pts, kml_name = parse_kml(kml_file)
        if reverse:
            utm_pts = utm_pts[::-1]
            print("  KML order reversed.")
        self.transect_name = name or kml_name
        self.coord_system  = 'geo'
        self.is_polyline   = True
        self.polyline_pts  = [Point(x, y, f'V{i}') for i, (x, y) in enumerate(utm_pts)]
        self.line_start    = self.polyline_pts[0]
        self.line_end      = self.polyline_pts[-1]

        self.line_length = sum(
            _dist(self.polyline_pts[i], self.polyline_pts[i+1])
            for i in range(len(self.polyline_pts) - 1)
        )
        print(f"  Total length: {self.line_length:.0f} m  |  Buffer: {buffer:.0f} m")

    # ------------------------------------------------------------------
    # ANALYSIS
    # ------------------------------------------------------------------

    def analyze(self, plot_margin: float = 5000.0, well_types: list = None):
        """
        Project all wells, filter by buffer, handle endpoint clustering.

        Parameters
        ----------
        well_types : list or None
            If provided, only wells whose well_type is in this list are
            considered. E.g. ['TRS (Seismic)', 'SEV/RGP (Resistivity)'].
            Default None means all types are included.
        """
        if self.line_start is None:
            raise RuntimeError("Call set_transect_from_points() or set_transect_from_kml() first.")

        # Filter by well type if requested
        if well_types:
            wells_to_analyze = [w for w in self.well_points if w.well_type in well_types]
            excluded = len(self.well_points) - len(wells_to_analyze)
            print(f"\nAnalyzing {len(wells_to_analyze)} wells "
                  f"(excluded {excluded} by type filter: {well_types})")
        else:
            wells_to_analyze = self.well_points
            print(f"\nAnalyzing {len(wells_to_analyze)} wells …")

        # Map extents
        if self.is_polyline:
            xs = [p.x for p in self.polyline_pts]
            ys = [p.y for p in self.polyline_pts]
        else:
            xs = [self.line_start.x, self.line_end.x]
            ys = [self.line_start.y, self.line_end.y]

        self.x_min = min(xs) - plot_margin
        self.x_max = max(xs) + plot_margin
        self.y_min = min(ys) - plot_margin
        self.y_max = max(ys) + plot_margin

        interior, ep_start, ep_end, all_view = [], [], [], []

        for well in wells_to_analyze:
            in_view = (self.x_min <= well.x <= self.x_max and
                       self.y_min <= well.y <= self.y_max)

            if self.is_polyline:
                proj     = project_point_to_polyline(well, self.polyline_pts)
                at_start = proj['at_start']
                at_end   = proj['at_end']
            else:
                proj     = project_point_to_segment(well, self.line_start, self.line_end)
                at_start = proj['at_start']
                at_end   = proj['at_end']

            within = proj['dist_to_line'] <= self.buffer

            rec = dict(
                well_id       = well.well_id,
                well_type     = well.well_type,
                elevation     = well.elevation,
                x             = well.x,
                y             = well.y,
                proj_x        = proj['proj_point'].x,
                proj_y        = proj['proj_point'].y,
                dist_along    = proj['dist_along'],
                dist_to_line  = proj['dist_to_line'],
                side          = proj['side'],
                within_buffer = within,
                at_start      = at_start,
                at_end        = at_end,
            )

            if in_view:
                all_view.append(rec)

            if within:
                if at_start:
                    ep_start.append((well, proj['dist_to_line'], rec))
                elif at_end:
                    ep_end.append((well, proj['dist_to_line'], rec))
                else:
                    interior.append(rec)

        # Endpoint clustering — keep only closest well at each end
        results = list(interior)
        for ep_list in (ep_start, ep_end):
            if ep_list:
                ep_list.sort(key=lambda t: t[1])
                best_well, _, best_rec = ep_list[0]
                results.append(best_rec)
                if len(ep_list) > 1:
                    print(f"  Endpoint cluster: kept '{best_well.well_id}', "
                          f"dropped {len(ep_list)-1} well(s)")

        self.results     = pd.DataFrame(results).sort_values('dist_along').reset_index(drop=True) if results else pd.DataFrame()
        self.all_in_view = pd.DataFrame(all_view)

        # Compute the span of wells along the profile (used consistently in both plots)
        if not self.results.empty:
            _min_d  = self.results['dist_along'].min()
            _max_d  = self.results['dist_along'].max()
            _pad    = (_max_d - _min_d) * 0.05 if (_max_d - _min_d) > 0 else 500
            self.profile_start = _min_d - _pad
            self.profile_end   = _max_d + _pad
        else:
            self.profile_start = 0.0
            self.profile_end   = self.line_length

        in_buf  = len(self.results)
        in_view = len(self.all_in_view)
        print(f"\n  Wells in buffer   : {in_buf}")
        print(f"  Wells in map view : {in_view}")
        print(f"  Outside buffer    : {in_view - in_buf}")
        if not self.results.empty:
            print(f"  Dist range        : {self.results['dist_along'].min():.0f} – "
                  f"{self.results['dist_along'].max():.0f} m")

        return self.results

    # ------------------------------------------------------------------
    # PLOTTING — MAP + OFFSET PROFILE
    # ------------------------------------------------------------------

    def plot_map_and_profile(self, output_file: str = None):
        """Two-panel figure: spatial map (left) and offset profile (right)."""
        if self.all_in_view is None:
            raise RuntimeError("Run analyze() first.")

        fig, (ax_map, ax_prof) = plt.subplots(1, 2, figsize=(18, 10))
        fig.patch.set_facecolor('#F0F2F5')
        for ax in (ax_map, ax_prof):
            ax.set_facecolor('#FAFAFA')

        # ── MAP ──────────────────────────────────────────────────────
        ax_map.set_title(f'{self.transect_name} — Map View',
                         fontweight='bold', fontsize=13, pad=12)

        # Draw transect line / polyline
        if self.is_polyline:
            px = [p.x for p in self.polyline_pts]
            py = [p.y for p in self.polyline_pts]
            ax_map.plot(px, py, color='#1A6FBF', linewidth=3,
                        label='Transect', zorder=5)
            ax_map.plot(px, py, 'o', color='#1A6FBF', markersize=4,
                        alpha=0.6, zorder=5)
        else:
            ax_map.plot([self.line_start.x, self.line_end.x],
                        [self.line_start.y, self.line_end.y],
                        color='#1A6FBF', linewidth=3, label='Transect', zorder=5)

            # Buffer polygon + endpoint circles
            dx = self.line_end.x - self.line_start.x
            dy = self.line_end.y - self.line_start.y
            length = math.hypot(dx, dy)
            if length > 0:
                perp = (-dy/length, dx/length)
                buf_poly = Polygon([
                    (self.line_start.x + perp[0]*self.buffer,
                     self.line_start.y + perp[1]*self.buffer),
                    (self.line_end.x   + perp[0]*self.buffer,
                     self.line_end.y   + perp[1]*self.buffer),
                    (self.line_end.x   - perp[0]*self.buffer,
                     self.line_end.y   - perp[1]*self.buffer),
                    (self.line_start.x - perp[0]*self.buffer,
                     self.line_start.y - perp[1]*self.buffer),
                ], facecolor='#1A6FBF', alpha=0.08,
                   edgecolor='#1A6FBF', linestyle='--', linewidth=1)
                ax_map.add_patch(buf_poly)
                for pt in (self.line_start, self.line_end):
                    ax_map.add_patch(plt.Circle(
                        (pt.x, pt.y), self.buffer,
                        color='#1A6FBF', fill=False,
                        linestyle=':', alpha=0.4, linewidth=1))

        # Wells outside buffer (faded)
        df_all = self.all_in_view
        out_buf = df_all[~df_all['within_buffer']]
        in_buf  = df_all[df_all['within_buffer']]

        for wt in out_buf['well_type'].unique() if not out_buf.empty else []:
            sub = out_buf[out_buf['well_type'] == wt]
            ax_map.scatter(sub['x'], sub['y'],
                           c=WELL_TYPE_COLORS.get(wt, '#888'),
                           s=40, alpha=0.25, marker='o',
                           edgecolors='gray', linewidth=0.5, zorder=2)

        # Wells inside buffer (solid) + projection lines
        for wt in in_buf['well_type'].unique() if not in_buf.empty else []:
            sub = in_buf[in_buf['well_type'] == wt]
            ax_map.scatter(sub['x'], sub['y'],
                           c=WELL_TYPE_COLORS.get(wt, '#888'),
                           s=80, alpha=0.95, marker='o',
                           edgecolors='black', linewidth=0.8,
                           label=f"{wt} (n={len(sub)})", zorder=4)

        if not in_buf.empty:
            for _, w in in_buf.iterrows():
                ax_map.plot([w['x'], w['proj_x']],
                            [w['y'], w['proj_y']],
                            'k--', alpha=0.25, linewidth=0.8, zorder=3)
                ax_map.plot(w['proj_x'], w['proj_y'],
                            'ko', markersize=3, alpha=0.4, zorder=5)

        # Labels for all wells in view
        for _, w in df_all.iterrows():
            bbox_kw = (dict(boxstyle='round,pad=0.2', facecolor='white',
                            edgecolor='black', alpha=0.85)
                       if w['within_buffer']
                       else dict(boxstyle='round,pad=0.1',
                                 facecolor='#E0E0E0',
                                 edgecolor='gray', alpha=0.5))
            ax_map.annotate(
                w['well_id'], (w['x'], w['y']),
                xytext=(5, 5), textcoords='offset points',
                fontsize=6.5,
                fontweight='bold' if w['within_buffer'] else 'normal',
                bbox=bbox_kw, zorder=6)

        # Start / End markers
        ax_map.plot(self.line_start.x, self.line_start.y,
                    'bs', markersize=11, zorder=7, label='Start')
        ax_map.plot(self.line_end.x, self.line_end.y,
                    'b^', markersize=11, zorder=7, label='End')
        for pt, lbl, va in [(self.line_start, 'START', 'top'),
                             (self.line_end,   'END',   'top')]:
            ax_map.annotate(lbl, (pt.x, pt.y),
                            xytext=(0, -14), textcoords='offset points',
                            ha='center', va=va, fontweight='bold', fontsize=8,
                            bbox=dict(boxstyle='round,pad=0.2',
                                      facecolor='#1A6FBF', alpha=0.25))

        ax_map.set_xlim(self.x_min, self.x_max)
        ax_map.set_ylim(self.y_min, self.y_max)
        ax_map.set_xlabel('Easting (m)', fontweight='bold')
        ax_map.set_ylabel('Northing (m)', fontweight='bold')
        ax_map.grid(True, alpha=0.3, linestyle='--')
        ax_map.legend(loc='upper right', fontsize=7.5, framealpha=0.9)
        ax_map.set_aspect('equal')

        # ── OFFSET PROFILE ───────────────────────────────────────────
        ax_prof.set_title(f'{self.transect_name} — Offset Profile',
                          fontweight='bold', fontsize=13, pad=12)

        if not self.results.empty:
            for wt in self.results['well_type'].unique():
                sub   = self.results[self.results['well_type'] == wt]
                color = WELL_TYPE_COLORS.get(wt, '#888')
                y_pos = sub['side'] * sub['dist_to_line']
                ax_prof.scatter(sub['dist_along'], y_pos,
                                c=color, s=100, alpha=0.85,
                                edgecolors='black', linewidth=0.5,
                                label=f"{wt} (n={len(sub)})", zorder=3)
                for _, w in sub.iterrows():
                    ax_prof.annotate(
                        w['well_id'],
                        (w['dist_along'], w['side']*w['dist_to_line']),
                        xytext=(5, 4), textcoords='offset points',
                        fontsize=7, fontweight='bold',
                        bbox=dict(boxstyle='round,pad=0.1',
                                  facecolor='white',
                                  edgecolor='none', alpha=0.7),
                        zorder=4)

        ax_prof.axhline(0, color='#1A6FBF', linewidth=2,
                        alpha=0.5, label='Transect')
        ax_prof.axhline( self.buffer, color='#E02020',
                         linestyle='--', linewidth=1.5,
                         alpha=0.6, label=f'+{self.buffer:.0f} m')
        ax_prof.axhline(-self.buffer, color='#E02020',
                         linestyle='--', linewidth=1.5, alpha=0.6,
                         label=f'−{self.buffer:.0f} m')

        ax_prof.set_xlabel('Distance Along Transect (m)', fontweight='bold')
        ax_prof.set_ylabel('Perpendicular Offset (m)  [+ right, − left]',
                           fontweight='bold')
        ax_prof.grid(True, alpha=0.3, linestyle='--')
        ax_prof.legend(loc='upper right', fontsize=7.5, framealpha=0.9)

        if not self.results.empty:
            max_p = self.results['dist_to_line'].max()
            ax_prof.set_xlim(-self.line_length*0.02, self.line_length*1.02)
            ax_prof.set_ylim(-max(max_p, self.buffer)*1.3,
                              max(max_p, self.buffer)*1.3)

        plt.tight_layout(pad=2.5)

        if output_file:
            plt.savefig(output_file, dpi=300, bbox_inches='tight')
            print(f"  Saved: {output_file}")
        else:
            plt.show()
        plt.close()

    # ------------------------------------------------------------------
    # PLOTTING — GEOLOGICAL CROSS-SECTION
    # ------------------------------------------------------------------

    def plot_cross_section(self, output_file: str = None,
                           max_depth: float = None,
                           show_labels: bool = True,
                           relative_depth: bool = False):
        """
        Full geological cross-section with lithological / geophysical
        columns and complete material symbology.

        Parameters
        ----------
        relative_depth : bool
            If True, all wells start at y=0 (depth below surface).
            If False (default), y-axis is elevation (m a.s.l.).
        """
        if self.results is None or self.results.empty:
            print("  WARNING: No wells in buffer — cannot draw cross-section.")
            return

        wells_on_line = self.results.copy()

        # x positions — use full transect length so gaps without data are visible
        sec_start = 0.0
        sec_end   = self.line_length
        sec_len   = sec_end - sec_start
        wells_on_line['x_pos'] = wells_on_line['dist_along'] - sec_start

        # Max depth from data
        if max_depth is None:
            depths = []
            for wn in wells_on_line['well_id']:
                sub = self.df[self.df['well_name'] == wn]
                if not sub.empty:
                    depths.append(sub['depth'].max())
            max_depth = max(depths) if depths else 500

        # Figure — white background
        fig_w = max(22, sec_len / 700)
        fig, ax = plt.subplots(figsize=(fig_w, 13))
        fig.patch.set_facecolor('white')
        ax.set_facecolor('white')

        type_header_colors = {
            'Lithological':           '#D6EAF8',
            'TRS (Seismic)':          '#FEF9E7',
            'SEV/RGP (Resistivity)':  '#EAFAF1',
            'RGP (Water Table)':      '#EBF5FB',
        }

        for _, well_row in wells_on_line.iterrows():
            wn        = well_row['well_id']
            x_pos     = well_row['x_pos']
            elevation = well_row['elevation'] if pd.notna(well_row['elevation']) else 2200
            wtype     = well_row['well_type']

            well_df = self.df[self.df['well_name'] == wn].sort_values('depth')
            if well_df.empty:
                continue

            col_w      = max(sec_len * 0.009, 60)
            prev_depth = 0

            for _, layer in well_df.iterrows():
                depth        = layer['depth']
                material_raw = layer['material'] if layer['material'] else 'UNKNOWN'
                mat_base     = material_raw.split()[0]
                color        = MATERIAL_COLORS.get(mat_base, '#A0A0A0')
                hatch        = MATERIAL_PATTERNS.get(mat_base, None)


                if relative_depth:
                    # y=0 at surface, depth increases downward as positive values
                    # Rectangle origin is at top_y (shallower = smaller number)
                    top_y   = prev_depth
                    bot_y   = depth
                    label_y = (top_y + bot_y) / 2
                    rect_y  = top_y          # matplotlib rect grows upward, axis inverted
                else:
                    top_y   = elevation - prev_depth
                    bot_y   = elevation - depth
                    label_y = (top_y + bot_y) / 2
                    rect_y  = bot_y

                layer_h = abs(bot_y - top_y)

                rect = Rectangle(
                    (x_pos - col_w/2, rect_y),
                    col_w, layer_h,
                    facecolor=color, edgecolor='#444444',
                    linewidth=0.4, alpha=0.92, hatch=hatch
                )
                ax.add_patch(rect)

                # Layer label
                if show_labels and layer_h > max_depth * 0.035:
                    if mat_base in ('C1', 'C2', 'C3', 'C4', 'C5'):
                        v = layer.get('velocity')
                        label = (f"{mat_base}\n{v:.0f} m/s"
                                 if pd.notna(v) else mat_base)
                    elif mat_base in ('UGE1', 'UGE2', 'UGE3', 'UGE'):
                        r = layer.get('resistivity')
                        label = (f"{mat_base}\n{r:.0f} Ω·m"
                                 if pd.notna(r) else mat_base)
                    else:
                        label = mat_base

                    ax.text(x_pos, label_y, label,
                            ha='center', va='center',
                            fontsize=5.5, fontweight='bold',
                            bbox=dict(boxstyle='round,pad=0.15',
                                      facecolor='white',
                                      edgecolor='none', alpha=0.75))

                prev_depth = depth

            # Well header — placed just above the top of the column
            if relative_depth:
                # In relative mode, y=0 is top; header goes slightly above 0
                # Since axis is inverted, "above 0" means negative y
                header_y = -max_depth * 0.025
            else:
                header_y = elevation + max_depth * 0.025

            ax.text(x_pos, header_y, wn,
                    rotation=90, fontsize=7, ha='center', va='bottom',
                    bbox=dict(boxstyle='round,pad=0.3',
                              facecolor=type_header_colors.get(wtype, 'white'),
                              edgecolor='#444', alpha=0.9, linewidth=0.6))

        # Axes
        ax.set_xlim(-sec_len * 0.02, sec_len * 1.02)

        if relative_depth:
            # y=0 at top (surface), max_depth at bottom — invert so 0 is up
            ax.set_ylim(max_depth * 1.05, -max_depth * 0.12)
            ax.set_ylabel('Depth (m)', fontweight='bold', fontsize=13)
        else:
            # Elevation mode — set limits from data
            elev_vals = []
            for _, wr in wells_on_line.iterrows():
                e = wr['elevation'] if pd.notna(wr['elevation']) else 2200
                elev_vals.append(e)
            max_elev = max(elev_vals) if elev_vals else 2200
            ax.set_ylim(max_elev - max_depth * 1.05,
                        max_elev + max_depth * 0.12)
            ax.set_ylabel('Elevation (m a.s.l.)', fontweight='bold', fontsize=13)

        ax.set_xlabel('Distance Along Transect (m)', fontweight='bold', fontsize=13)

        if self.coord_system == 'geo' and self.start_geo and self.end_geo:
            coord_str = (f"({self.start_geo[0]:.5f}°, {self.start_geo[1]:.5f}°) → "
                         f"({self.end_geo[0]:.5f}°, {self.end_geo[1]:.5f}°)")
        else:
            coord_str = (f"({self.line_start.x:.0f}, {self.line_start.y:.0f}) → "
                         f"({self.line_end.x:.0f}, {self.line_end.y:.0f})")

        depth_mode = 'relative depth' if relative_depth else 'elevation'
        ax.set_title(
            f"{self.transect_name}\n{coord_str}\n"
            f"Length: {sec_len:.0f} m  |  Wells: {len(wells_on_line)}  |  "
            f"Buffer: {self.buffer:.0f} m  |  Mode: {depth_mode}",
            fontweight='bold', fontsize=11, pad=16)

        ax.grid(True, alpha=0.35, linestyle='--', color='#AAAAAA')

        # ── LEGEND ───────────────────────────────────────────────────
        shown_materials = set()
        for _, wr in wells_on_line.iterrows():
            sub = self.df[self.df['well_name'] == wr['well_id']]
            for _, l in sub.iterrows():
                mb = l['material'].split()[0] if l['material'] else 'UNKNOWN'
                shown_materials.add(mb)

        mat_handles = [
            mpatches.Patch(facecolor=MATERIAL_COLORS.get(m, '#A0A0A0'),
                           edgecolor='black', linewidth=0.5,
                           hatch=MATERIAL_PATTERNS.get(m, None), label=m)
            for m in sorted(shown_materials)
        ]

        wt_handles = [
            mpatches.Patch(facecolor=col, edgecolor='black',
                           linewidth=0.5, label=wt)
            for wt, col in WELL_TYPE_COLORS.items()
            if wt in wells_on_line['well_type'].values
        ]

        ax.legend(handles=wt_handles + [Line2D([0],[0],color='none')] + mat_handles,
                  loc='lower right', fontsize=6.5, ncol=2, framealpha=0.92,
                  title='Well types  /  Materials', title_fontsize=7)

        plt.tight_layout(pad=2)

        if output_file:
            plt.savefig(output_file, dpi=300, bbox_inches='tight')
            print(f"  Saved: {output_file}")
        else:
            plt.show()
        plt.close()

    # ------------------------------------------------------------------
    # EXPORT
    # ------------------------------------------------------------------

    def export_wells(self, output_file: str = None):
        """
        Export the wells used in the transect to CSV.

        Columns: well_id, well_type, x, y, elevation,
                 dist_along (m), dist_to_line (m), side (+1 right / -1 left).
        """
        if self.results is None or self.results.empty:
            print("  WARNING: No results to export.")
            return

        cols = ['well_id', 'well_type', 'x', 'y', 'elevation',
                'dist_along', 'dist_to_line', 'side']
        out = self.results[[c for c in cols if c in self.results.columns]].copy()
        out = out.sort_values('dist_along').reset_index(drop=True)
        out.index += 1                         # 1-based position in profile
        out.index.name = 'position'

        if output_file is None:
            output_file = os.path.join(
                self.output_dir,
                f"{self.transect_name}_buf{int(self.buffer)}m_wells.csv")

        out.to_csv(output_file)
        print(f"  Saved: {output_file}")
        return out

    # ------------------------------------------------------------------
    # CONVENIENCE — run everything
    # ------------------------------------------------------------------

    def run(self, plot_margin: float = 5000.0,
            max_depth: float = None,
            show_labels: bool = True,
            relative_depth: bool = False,
            export_wells: bool = False,
            well_types: list = None):
        """Analyze and generate all output figures (and optionally a CSV)."""
        self.analyze(plot_margin=plot_margin, well_types=well_types)

        # Build filename: include type-filter suffix when active
        buf_tag  = f"_buf{int(self.buffer)}m"
        if well_types:
            # Short abbreviations for each type
            _abbrev = {
                'TRS (Seismic)':          'seis',
                'SEV/RGP (Resistivity)':  'res',
                'Lithological':           'lith',
                'RGP (Water Table)':      'wt',
            }
            type_tag = "_" + "+".join(_abbrev.get(t, t) for t in well_types)
        else:
            type_tag = ""

        stem = os.path.join(self.output_dir,
                            f"{self.transect_name}{buf_tag}{type_tag}")

        depth_suffix = "_reldepth" if relative_depth else ""

        print("\nGenerating figures …")
        self.plot_map_and_profile(f"{stem}_map_profile.png")
        self.plot_cross_section(f"{stem}_cross_section{depth_suffix}.png",
                                max_depth=max_depth,
                                show_labels=show_labels,
                                relative_depth=relative_depth)

        if export_wells:
            self.export_wells(f"{stem}_wells.csv")

        print(f"\nAll outputs saved to: {self.output_dir}/")


# ============================================================================
# CLI
# ============================================================================

def _print_help():
    print("""
===============================================================================
  MEXICO VALLEY BASIN — TRANSECT GENERATOR  v1.1
===============================================================================

USAGE
  python transect_generator.py -i <file.lth> -s [OPTIONS]

TRANSECT INPUT  (choose one)
  --coords {utm|geo}        Two-point transect via explicit coordinates
  --from-wells ID1 ID2      Two-point transect using existing well IDs as endpoints
  --kml    <file.kml>       KML polyline transect (multi-segment)
  --reverse-kml             Reverse the KML vertex order (swap start/end)

TWO-POINT COORDINATES
  UTM (meters):
    --x1 --y1 --x2 --y2
  Geographic (decimal degrees):
    --lat1 --lon1 --lat2 --lon2

OPTIONS
  --name            NAME    Transect name (default: auto)
  --buffer          METERS  Buffer radius (default: 1000)
  --margin          METERS  Map margin around transect (default: 5000)
  --output          DIR     Output directory (default: transect_output)
  --no-labels               Hide layer labels in cross-section
  --relative-depth          Plot depth from 0 (surface) instead of elevation
  --export-wells            Export CSV table of wells used in transect
  --types TYPE [TYPE ...]   Filter well types to include (default: all)
                              seismic / seis
                              resistivity / res
                              lithological / lith
                              watertable / wt
  -h, --help                Show this help

OUTPUTS  (buffer + active type filter always included in filename)
  <n>_buf<N>m_map_profile.png           Map view + offset profile
  <n>_buf<N>m_cross_section.png         Geological cross-section
  <n>_buf<N>m_<types>_wells.csv         Well table (only with --export-wells)

EXAMPLES
  Geographic two-point:
    python transect_generator.py -i Totalok.lth -s --coords geo \\
        --lat1 19.3035 --lon1 -99.1499 \\
        --lat2 19.3622 --lon2 -99.1432 \\
        --name Azteca_Ermita --buffer 2000 --export-wells

  From two wells by ID:
    python transect_generator.py -i Totalok.lth -s \\
        --from-wells TRS24B TRS22F --buffer 1500

  From two wells, seismic + resistivity only:
    python transect_generator.py -i Totalok.lth -s \\
        --from-wells TRS24B TRS22F --buffer 1500 --types seismic resistivity

  Seismic + resistivity only (explicit coords):
    python transect_generator.py -i Totalok.lth -s --coords geo \\
        --lat1 19.3035 --lon1 -99.1499 \\
        --lat2 19.3622 --lon2 -99.1432 \\
        --name Azteca_Ermita --buffer 2000 --types seismic resistivity

  UTM two-point, relative depth:
    python transect_generator.py -i Totalok.lth -s --coords utm \\
        --x1 485000 --y1 2135000 --x2 490000 --y2 2140000 \\
        --name NS_Section --buffer 1000 --relative-depth

  KML polyline, lithological only:
    python transect_generator.py -i Totalok.lth -s --kml transect.kml \\
        --buffer 2000 --name MyPolyline --types lith

MEXICO CITY REFERENCE
  UTM  : X ~480 000–513 000 m  |  Y ~2 127 000–2 370 000 m
  Geo  : Lat ~19.0–19.6 °N    |  Lon ~-99.4 to -98.9 W
===============================================================================
""")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('-h', '--help',           action='store_true')
    parser.add_argument('-i', '--input',           type=str)
    parser.add_argument('-s', '--section',         action='store_true')
    parser.add_argument('--output',                type=str, default='transect_output')
    parser.add_argument('--name',                  type=str)
    parser.add_argument('--buffer',                type=float, default=1000.0)
    parser.add_argument('--margin',                type=float, default=5000.0)
    parser.add_argument('--no-labels',             action='store_true')
    parser.add_argument('--relative-depth',        action='store_true', dest='relative_depth')
    parser.add_argument('--export-wells',          action='store_true', dest='export_wells')
    parser.add_argument('--types', nargs='+', metavar='TYPE',
                       help='Well types to include (default: all)')
    parser.add_argument('--kml',                   type=str)
    parser.add_argument('--reverse-kml',           action='store_true', dest='reverse_kml',
                       help='Reverse the vertex order of the KML polyline')
    parser.add_argument('--from-wells', nargs=2, metavar=('START_ID', 'END_ID'),
                       dest='from_wells',
                       help='Define transect endpoints by well ID')
    parser.add_argument('--coords',                type=str, choices=['utm', 'geo'])
    parser.add_argument('--x1',                    type=float)
    parser.add_argument('--y1',                    type=float)
    parser.add_argument('--x2',                    type=float)
    parser.add_argument('--y2',                    type=float)
    parser.add_argument('--lat1',                  type=float)
    parser.add_argument('--lon1',                  type=float)
    parser.add_argument('--lat2',                  type=float)
    parser.add_argument('--lon2',                  type=float)

    args = parser.parse_args()

    if args.help or len(sys.argv) == 1:
        _print_help()
        return 0

    if not args.input:
        print("ERROR: -i / --input is required.")
        return 1
    if not os.path.exists(args.input):
        print(f"ERROR: File not found: {args.input}")
        return 1
    if not args.section:
        print("ERROR: Use -s to create a transect.")
        _print_help()
        return 1
    if not args.kml and not args.coords and not args.from_wells:
        print("ERROR: Provide one of: --kml <file>, --coords {utm|geo}, "
              "or --from-wells START_ID END_ID.")
        return 1

    print("=" * 70)
    print("  TRANSECT GENERATOR  v1.1")
    print("=" * 70)

    try:
        analyzer = TransectAnalyzer(args.input, args.output)

        if args.kml:
            analyzer.set_transect_from_kml(
                args.kml,
                buffer=args.buffer,
                name=args.name,
                reverse=args.reverse_kml)

        elif args.from_wells:
            start_id, end_id = args.from_wells
            # Look up UTM coordinates from the parsed well list
            well_lookup = {w.well_id: w for w in analyzer.well_points}
            missing = [wid for wid in (start_id, end_id) if wid not in well_lookup]
            if missing:
                print(f"ERROR: Well(s) not found in data: {missing}")
                print(f"  Available wells: "
                      f"{sorted(well_lookup.keys())[:20]} "
                      f"({'...' if len(well_lookup) > 20 else ''})")
                return 1
            w_start = well_lookup[start_id]
            w_end   = well_lookup[end_id]
            coord1  = (w_start.x, w_start.y)
            coord2  = (w_end.x,   w_end.y)
            name    = args.name or f"{start_id}_to_{end_id}"
            print(f"\n  Start well '{start_id}': UTM ({w_start.x:.0f}, {w_start.y:.0f})")
            print(f"  End   well '{end_id}':   UTM ({w_end.x:.0f}, {w_end.y:.0f})")
            analyzer.set_transect_from_points(
                coord1, coord2,
                coord_system='utm',
                name=name,
                buffer=args.buffer)

        else:
            if args.coords == 'geo':
                if not all([args.lat1, args.lon1, args.lat2, args.lon2]):
                    print("ERROR: Geographic mode requires --lat1 --lon1 --lat2 --lon2")
                    return 1
                coord1, coord2 = (args.lat1, args.lon1), (args.lat2, args.lon2)
            else:
                if not all([args.x1, args.y1, args.x2, args.y2]):
                    print("ERROR: UTM mode requires --x1 --y1 --x2 --y2")
                    return 1
                coord1, coord2 = (args.x1, args.y1), (args.x2, args.y2)

            name = args.name or (
                f"Transect_{args.lat1:.4f}_{args.lon1:.4f}"
                if args.coords == 'geo'
                else f"Transect_{int(args.x1)}_{int(args.y1)}"
            )

            analyzer.set_transect_from_points(
                coord1, coord2,
                coord_system=args.coords,
                name=name,
                buffer=args.buffer)

        # Map short CLI tokens to full internal type names
        TYPE_MAP = {
            "seismic":      "TRS (Seismic)",
            "seis":         "TRS (Seismic)",
            "resistivity":  "SEV/RGP (Resistivity)",
            "res":          "SEV/RGP (Resistivity)",
            "lithological": "Lithological",
            "lith":         "Lithological",
            "watertable":   "RGP (Water Table)",
            "wt":           "RGP (Water Table)",
        }
        if args.types:
            well_types = []
            for t in args.types:
                mapped = TYPE_MAP.get(t.lower())
                if mapped is None:
                    print(f"WARNING: Unknown type '{t}'. "
                          f"Valid options: {list(TYPE_MAP.keys())}")
                elif mapped not in well_types:
                    well_types.append(mapped)
            if not well_types:
                print("ERROR: No valid well types specified.")
                return 1
        else:
            well_types = None

        analyzer.run(
            plot_margin=args.margin,
            show_labels=not args.no_labels,
            relative_depth=args.relative_depth,
            export_wells=args.export_wells,
            well_types=well_types)

        print("\n" + "=" * 70)
        print("  DONE")
        print("=" * 70)
        return 0

    except Exception as exc:
        print(f"\nERROR: {exc}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
