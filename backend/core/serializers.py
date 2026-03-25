from rest_framework import serializers
from .models import User, Role, Module, Inventario, Pozo, Litologia, PuntoInSAR
from django.contrib.auth import get_user_model
from pyproj import Transformer

User = get_user_model()
utm_to_wgs84 = Transformer.from_crs("epsg:32614", "epsg:4326", always_xy=True)


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    module_ids = serializers.PrimaryKeyRelatedField(
        queryset=Module.objects.all(), write_only=True, many=True, source='modules'
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'modules', 'module_ids']

    def create(self, validated_data):
        modules = validated_data.pop('modules', [])
        role = Role.objects.create(**validated_data)
        role.modules.set(modules)
        return role

    def update(self, instance, validated_data):
        modules = validated_data.pop('modules', None)
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        if modules is not None:
            instance.modules.set(modules)
        return instance

class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.SerializerMethodField()
    module_codes = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'role_name', 'module_codes', 'is_active', 'is_staff', 'is_superuser']
        extra_kwargs = {'password': {'write_only': True}}

    def get_role_name(self, obj):
        if obj.is_superuser:
            return "Super User"
        return obj.role.name if obj.role else "User"

    def get_module_codes(self, obj):
        if obj.is_superuser:
            return list(Module.objects.values_list('code', flat=True))
        if obj.role:
            return list(obj.role.modules.values_list('code', flat=True))
        return []

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para actualización de perfil propio.
    Solo permite modificar campos seguros.
    """
    role_name = serializers.SerializerMethodField()
    module_codes = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role_name', 'module_codes']
        read_only_fields = ['id', 'role_name', 'module_codes']
    
    def get_role_name(self, obj):
        if obj.is_superuser:
            return "Super User"
        return obj.role.name if obj.role else "Usuario"
    
    def get_module_codes(self, obj):
        if obj.is_superuser:
            return list(Module.objects.values_list('code', flat=True))
        if obj.role:
            return list(obj.role.modules.values_list('code', flat=True))
        return []


class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = "__all__"

class LitologiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Litologia
        fields = "__all__"

class PozoSerializer(serializers.ModelSerializer):
    capas = LitologiaSerializer(many=True, read_only=True)
    x = serializers.SerializerMethodField()
    y = serializers.SerializerMethodField()
    
    class Meta:
        model = Pozo
        fields = ['id', 'name', 'x', 'y', 'elevation', 'well_type', 'capas']

    def get_x(self, obj):
        if obj.x and obj.y:
            lng, _ = utm_to_wgs84.transform(obj.x, obj.y)
            return lng
        return obj.x

    def get_y(self, obj):
        if obj.x and obj.y:
            _, lat = utm_to_wgs84.transform(obj.x, obj.y)
            return lat
        return obj.y

class PuntoInSARSerializer(serializers.ModelSerializer):
    class Meta:
        model = PuntoInSAR
        fields = "__all__"
