from rest_framework import serializers
from .models import Idea


class IdeaSerializer(serializers.ModelSerializer):
    vote_count = serializers.IntegerField(read_only=True, default=0)
    created_by = serializers.StringRelatedField(read_only=True)
    user_has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = ['id', 'title', 'description', 'vote_count', 'created_by', 'created_at', 'user_has_voted']
        read_only_fields = ['id', 'created_at', 'created_by', 'vote_count', 'user_has_voted']

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError('Title must be at least 3 characters.')
        return value

    def validate_description(self, value):
        if len(value) > 5000:
            raise serializers.ValidationError('Description must be at most 5000 characters.')
        return value

    def get_user_has_voted(self, obj):
        return obj.id in self.context.get('user_voted_ids', set())
