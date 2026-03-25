import os
import re
from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import Pozo, Litologia

class Command(BaseCommand):
    help = 'Importa datos de pozos y litología desde la carpeta PLATAFORMA'

    def handle(self, *args, **options):
        # Ruta a los archivos .lth
        base_path = os.path.join(settings.BASE_DIR, '..', 'PLATAFORMA', 'PLATAFORMA', 'well_data', 'raw_data')
        
        if not os.path.exists(base_path):
            self.stdout.write(self.style.ERROR(f'No se encontró la ruta: {base_path}'))
            return

        lth_files = [f for f in os.listdir(base_path) if f.endswith('.lth')]
        
        if not lth_files:
            self.stdout.write(self.style.WARNING('No se encontraron archivos .lth'))
            return

        for filename in lth_files:
            file_path = os.path.join(base_path, filename)
            self.stdout.write(f'Procesando {filename}...')
            self.parse_lth(file_path)

        self.stdout.write(self.style.SUCCESS('Importación completada con éxito.'))

    def _layer_type(self, material):
        if 'V=' in material or (re.match(r'^C\d', material) and 'V' in material):
            return 'TRS (Seismic)'
        if 'UGE' in material and ('R=' in material or 'OHM-M' in material):
            return 'SEV/RGP (Resistivity)'
        if 'NAF' in material:
            return 'RGP (Water Table)'
        return 'Lithological'

    def _extract_resistivity(self, s):
        m = re.search(r'R[=:]?\s*(\d+\.?\d*)', s)
        return float(m.group(1)) if m else None

    def _extract_velocity(self, s):
        m = re.search(r'V\d*[=:]?\s*(\d+\.?\d*)', s)
        return float(m.group(1)) if m else None

    def _classify_uge(self, r):
        if r is None: return None
        if r <= 17: return 'UGE1'
        elif r <= 473: return 'UGE2'
        return 'UGE3'

    def parse_lth(self, filepath):
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as fh:
            lines = fh.readlines()

        current_well = None
        i = 0
        while i < len(lines):
            line = lines[i].strip()

            if line.startswith('WELL:'):
                name = line.split('WELL:')[1].strip()
                current_well, created = Pozo.objects.get_or_create(name=name)
                if created:
                    self.stdout.write(f'  Pozo creado: {name}')

            elif line.startswith('X:') and current_well:
                try:
                    current_well.x = float(line.split('X:')[1].strip())
                    current_well.save()
                except: pass

            elif line.startswith('Y:') and current_well:
                try:
                    current_well.y = float(line.split('Y:')[1].strip())
                    current_well.save()
                except: pass

            elif line.startswith('ELEV:') and current_well:
                try:
                    current_well.elevation = float(line.split('ELEV:')[1].strip())
                    current_well.save()
                except: pass

            elif line.startswith('LITH:') and current_well:
                i += 1
                # Limpiar capas previas para evitar duplicados si re-importamos
                current_well.capas.all().delete()
                
                while i < len(lines):
                    ll = lines[i].strip()
                    if ll.startswith('WELL:') or not ll:
                        i -= 1
                        break
                    try:
                        parts = ll.split(None, 1)
                        if len(parts) >= 2:
                            depth = float(parts[0])
                            mat = parts[1].strip()
                            res = self._extract_resistivity(mat)
                            vel = self._extract_velocity(mat)
                            
                            Litologia.objects.create(
                                pozo=current_well,
                                depth=depth,
                                material=mat,
                                resistivity=res,
                                velocity=vel,
                                uge_class=self._classify_uge(res)
                            )
                    except: pass
                    i += 1
            i += 1
