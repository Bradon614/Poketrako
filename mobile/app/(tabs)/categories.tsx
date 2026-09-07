import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/api';
import {
  Screen,
  Card,
  Button,
  Input,
  Heading,
  AppText,
  EmptyState,
  LoadingState,
  IconButton,
  RefreshableList,
  colors,
  spacing,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { confirmDialog, showError } from '@/utils/notify';

export default function CategoriesScreen() {
  const { categories, loading, refetch, create, update, remove } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setNameError('');
    setEditingCategory(null);
    setShowForm(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setNameError('Le nom est requis');
      return false;
    }
    if (name.trim().length > 100) {
      setNameError('Maximum 100 caractères');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingCategory) {
        await update(editingCategory.id, { name: name.trim() });
      } else {
        await create({ name: name.trim() });
      }
      resetForm();
    } catch (err: any) {
      showError(err.message || 'Impossible de sauvegarder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    const confirmed = await confirmDialog({
      title: 'Supprimer la catégorie',
      message: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await remove(category.id);
    } catch (err: any) {
      showError(err.message || 'Impossible de supprimer');
    }
  };

  const handleAddCategory = () => {
    resetForm();
    setShowForm(true);
  };

  if (loading && categories.length === 0) {
    return (
      <Screen>
        <LoadingState message="Chargement des catégories..." fullScreen />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Heading level={2}>Catégories</Heading>
        <Button title="Ajouter" onPress={handleAddCategory} variant="primary" size="sm" />
      </View>

      {showForm && (
        <CategoryForm
          name={name}
          nameError={nameError}
          submitting={submitting}
          editing={!!editingCategory}
          onNameChange={setName}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {categories.length === 0 ? (
        <EmptyState
          title="Aucune catégorie"
          message="Créez votre première catégorie pour organiser vos dépenses"
          icon={<Ionicons name="pricetags-outline" size={48} color={colors.textMuted} />}
          action={{ label: 'Créer une catégorie', onPress: handleAddCategory }}
        />
      ) : (
        <RefreshableList
          refreshing={loading}
          onRefresh={refetch}
          contentContainerStyle={styles.list}
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </RefreshableList>
      )}
    </Screen>
  );
}

const CategoryForm: React.FC<{
  name: string;
  nameError: string;
  submitting: boolean;
  editing: boolean;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ name, nameError, submitting, editing, onNameChange, onSubmit, onCancel }) => {
  return (
    <Card style={styles.formCard}>
      <View style={styles.formHeader}>
        <Heading level={3}>{editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</Heading>
        <IconButton
          icon={<Ionicons name="close" size={24} color={colors.textSecondary} />}
          onPress={onCancel}
          size="sm"
          variant="ghost"
        />
      </View>

      <Input
        label="Nom *"
        value={name}
        onChangeText={onNameChange}
        placeholder="Ex: Alimentation, Transport, Loisirs..."
        error={nameError}
        maxLength={100}
        style={styles.input}
      />

      <View style={styles.formActions}>
        <Button title="Annuler" onPress={onCancel} variant="secondary" fullWidth />
        <Button
          title={editing ? 'Modifier' : 'Créer'}
          onPress={onSubmit}
          fullWidth
          loading={submitting}
        />
      </View>
    </Card>
  );
};

const CategoryCard: React.FC<{
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}> = ({ category, onEdit, onDelete }) => {
  return (
    <Card style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryMain}>
          <AppText variant="body" color={colors.text} style={styles.categoryName}>
            {category.name}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            Créée le {new Date(category.createdAt).toLocaleDateString('fr-FR')}
          </AppText>
        </View>
        <View style={styles.categoryActions}>
          <IconButton
            icon={<Ionicons name="create-outline" size={20} color={colors.textSecondary} />}
            onPress={() => onEdit(category)}
            size="sm"
            variant="ghost"
            accessibilityLabel="Modifier"
          />
          <IconButton
            icon={<Ionicons name="trash-outline" size={20} color={colors.error} />}
            onPress={() => onDelete(category)}
            size="sm"
            variant="ghost"
            accessibilityLabel="Supprimer"
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  formActions: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  categoryCard: {
    marginBottom: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryMain: {
    flex: 1,
  },
  categoryName: {
    marginBottom: spacing.xs,
  },
  categoryActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: spacing.xs,
  },
});
