from rest_framework import serializers

from actions.models import Action, Photo, SocialNetworkLink


class SocialNetworkLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialNetworkLink
        fields = ('name', 'url')


class PhotoSerializer(serializers.ModelSerializer):
    width = serializers.IntegerField(source='get_width')
    height = serializers.IntegerField(source='get_height')

    class Meta:
        model = Photo
        fields = ('photo', 'width', 'height')


class ActionDetailSerializer(serializers.ModelSerializer):
    links = SocialNetworkLinkSerializer(many=True)

    class Meta:
        model = Action
        fields = ('title', 'description', 'short_description',
                  'main_organizer', 'links', 'video', 'slug')


class ActionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = ('title', 'description', 'short_description', 'slug')