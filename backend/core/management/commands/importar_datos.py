import os
import pandas as pd
from django.core.management.base import BaseCommand
from core.models import Pozo, Litologia

class Command(BaseCommand):
    help = 'Importa datos desde archivos .lth a la base de datos PostgreSQL'

    def add_arguments(self, parser):
        parser.add_argument('path', type=str, help='Ruta a un archivo .lth o un directorio con archivos .lth')

    def handle(self, *args, **options):
        path = options['path']
        if not os.path.exists(path):
            self.stderr.write(self.style.ERROR(f"Ruta no encontrada: {path}"))
            return

        files = []
        if os.path.isfile(path) and path.endswith('.lth'):
            files.append(path)
        elif os.path.isdir(path):
            files = [os.path.join(path, f) for f in os.listdir(path) if f.endswith('.lth')]

        if not files:
            self.stdout.write(self.style.WARNING("No se encontraron archivos .lth para procesar."))
            return

        self.stdout.write(f"Iniciando importación de {len(files)} archivos...")

        # Importar la lógica de parseo centralizada
        from core.utils.transect.transect_generator import parse_lth
        
        total_wells = 0
        total_layers = 0

        for lth_file in files:
            self.stdout.write(f"Procesando: {os.path.basename(lth_file)}...")
            try:
                well_points, df = parse_lth(lth_file)
                
                for wp in well_points:
                    pozo, created = Pozo.objects.update_or_create(
                        name=wp.well_id,
                        defaults={
                            'x': wp.x,
                            'y': wp.y,
                            'elevation': wp.elevation,
                            'well_type': wp.well_type
                        }
                    )
                    if created: total_wells += 1

                    # Filtrar capas y limpiar previas
                    layers = df[df['well_name'] == wp.well_id]
                    pozo.capas.all().delete()
                    
                    for _, row in layers.iterrows():
                        resists = row.get('resistivity')
                        vels = row.get('velocity')
                        
                        Litologia.objects.create(
                            pozo=pozo,
                            depth=row['depth'],
                            material=row['material'],
                            resistivity=None if pd.isna(resists) else resists,
                            velocity=None if pd.isna(vels) else vels,
                            uge_class=row.get('uge_class')
                        )
                        total_layers += 1

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error en {lth_file}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(
            f"Importación finalizada: {total_wells} pozos y {total_layers} capas actualizadas en PostgreSQL."
        ))
