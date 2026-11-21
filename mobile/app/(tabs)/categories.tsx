import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/api';
import {
  Appear,
  AppText,
  Button,
  Card,
  EmptyState,
  GlassSurface,
  Heading,
  IconButton,
  Input,
  LoadingState,
  RefreshableList,
  Screen,
  ScreenHeader,
  SectionHeader,
} from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { confirmDialog, showError, getCategoryVisual } from '@/utils';
import { radius, spacing, useThemedStyles, type Theme } from '@/theme';

export default function CategoriesScreen() {
  const styles = useThemedStyles(createStyles);
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
      <ScreenHeader
        title="Catégories"
        subtitle={
          categories.length > 0
            ? `${categories.length} catégorie${categories.length > 1 ? 's' : ''} pour classer vos dépenses`
            : 'Organisez vos dépenses par thème'
        }
        actions={
          showForm ? undefined : (
            <Button title="Ajouter" onPress={handleAddCategory} variant="primary" size="sm" icon="add" pill />
          )
        }
      />

      {showForm && (
        <Appear>
          <CategoryForm
            name={name}
            nameError={nameError}
            submitting={submitting}
            editing={!!editingCategory}
            onNameChange={setName}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        </Appear>
      )}

      {categories.length === 0 ? (
        <EmptyState
          title="Aucune catégorie"
          message="Créez votre première catégorie pour organiser vos dépenses (Alimentation, Transport, Logement…)."
          iconName="pricetags-outline"
          action={{ label: 'Créer une catégorie', onPress: handleAddCategory }}
        />
      ) : (
        <RefreshableList
          refreshing={loading}
          onRefresh={refetch}
          style={styles.list}
          tabBarSpace
          contentContainerStyle={styles.listContent}
        >
          {!showForm && (
            <SectionHeader title="Toutes les catégories" caption="Icône et couleur générées automatiquement" />
          )}

          {categories.map((category, index) => {
            const visual = getCategoryVisual(category.name);
            const isEditing = editingCategory?.id === category.id && showForm;
            return (
              <Appear key={category.id} delay={Math.min(index, 8) * 25} offset={10}>
                <GlassSurface
                  variant="card"
                  padding="none"
                  style={[styles.card, isEditing && styles.cardEditing]}
                >
                  <View style={styles.row}>
                    <View style={[styles.iconWell, { backgroundColor: `${visual.color}1F` }]}>
                      <Ionicons name={visual.icon} size={20} color={visual.color} />
                    </View>

                    <View style={styles.main}>
                      <AppText variant="body" numberOfLines={1}>
                        {category.name}
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        Créée le {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                      </AppText>
                    </View>

                    <View style={styles.actions}>
                      <IconButton
                        name="create-outline"
                        onPress={() => handleEdit(category)}
                        size="sm"
                        variant="glass"
                        accessibilityLabel={`Modifier ${category.name}`}
                      />
                      <IconButton
                        name="trash-outline"
                        onPress={() => handleDelete(category)}
                        size="sm"
                        variant="danger"
                        accessibilityLabel={`Supprimer ${category.name}`}
                      />
                    </View>
                  </View>
                </GlassSurface>
              </Appear>
            );
          })}
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
  const styles = useThemedStyles(createStyles);

  return (
    <Card style={styles.formCard} padding="lg">
      <View style={styles.formHeader}>
        <Heading level={3}>{editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</Heading>
        <IconButton
          name="close"
          onPress={onCancel}
          size="sm"
          variant="glass"
          accessibilityLabel="Fermer"
        />
      </View>

      <Input
        label="Nom"
        value={name}
        onChangeText={onNameChange}
        placeholder="Ex : Alimentation, Transport, Loisirs…"
        error={nameError}
        maxLength={100}
        autoFocus
        style={styles.formInput}
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    list: {
      flex: 1,
    },
    listContent: {
      gap: spacing.sm + 4,
      paddingTop: spacing.xxs,
    },
    card: {
      borderRadius: radius.xl,
    },
    cardEditing: {
      borderColor: theme.colors.accent,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md - 2,
    },
    iconWell: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md - 4,
    },
    main: {
      flex: 1,
      minWidth: 0,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    formCard: {
      marginBottom: spacing.lg,
      borderRadius: radius.xl,
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    formInput: {
      marginBottom: spacing.md,
    },
    formActions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
  });
