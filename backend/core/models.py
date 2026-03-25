from django.db import models
from django.contrib.auth.models import AbstractUser

class Module(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    modules = models.ManyToManyField(Module, related_name='roles', blank=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    def __str__(self):
        return self.username


class Inventario(models.Model):
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Inventario"
        verbose_name_plural = "Inventarios"

    def __str__(self):
        return self.name


class Pozo(models.Model):
    name      = models.CharField(max_length=200, unique=True)
    x         = models.FloatField(null=True, blank=True)
    y         = models.FloatField(null=True, blank=True)
    elevation = models.FloatField(null=True, blank=True)
    well_type = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name

class Litologia(models.Model):
    pozo        = models.ForeignKey(Pozo, on_delete=models.CASCADE, related_name='capas')
    depth       = models.FloatField()
    material    = models.CharField(max_length=255)
    resistivity = models.FloatField(null=True, blank=True)
    velocity    = models.FloatField(null=True, blank=True)
    uge_class   = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.pozo.name} - {self.depth}m"

class PuntoInSAR(models.Model):
    lat         = models.FloatField()
    lon         = models.FloatField()
    subsidence  = models.FloatField()  # Velocidad de subsidencia anual, por ejemplo
    location    = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"InSAR ({self.lat}, {self.lon})"
