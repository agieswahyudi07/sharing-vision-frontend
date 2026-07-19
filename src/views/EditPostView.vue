<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API_BASE_URL } from '../config'

const router = useRouter()
const route = useRoute()
const triggerToast = inject<(msg: string, type?: 'success' | 'error') => void>('triggerToast')

const id = route.params.id

const title = ref('')
const content = ref('')
const category = ref('')
const originalStatus = ref('')
const loading = ref(true)
const submitting = ref(false)

const validationErrors = ref<Record<string, string>>({})

// Client-side validations
const isTitleValid = computed(() => title.value.trim().length >= 20)
const isContentValid = computed(() => content.value.trim().length >= 200)
const isCategoryValid = computed(() => category.value.trim().length >= 3)

const fetchArticleDetails = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/article/${id}`)
    if (res.ok) {
      const data = await res.json()
      title.value = data.title
      content.value = data.content
      category.value = data.category
      originalStatus.value = data.status
    } else {
      if (triggerToast) triggerToast('Failed to fetch article details', 'error')
      router.push('/')
    }
  } catch (error) {
    if (triggerToast) triggerToast('Network error while loading article', 'error')
    router.push('/')
  } finally {
    loading.value = false
  }
}

const handleUpdate = async (status: 'publish' | 'draft') => {
  validationErrors.value = {}

  let hasErrors = false
  if (!isTitleValid.value) {
    validationErrors.value.title = 'Title must be at least 20 characters.'
    hasErrors = true
  }
  if (!isContentValid.value) {
    validationErrors.value.content = 'Content must be at least 200 characters.'
    hasErrors = true
  }
  if (!isCategoryValid.value) {
    validationErrors.value.category = 'Category must be at least 3 characters.'
    hasErrors = true
  }

  if (hasErrors) {
    if (triggerToast) triggerToast('Please fix the validation errors before submitting.', 'error')
    return
  }

  submitting.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/article/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.value.trim(),
        content: content.value.trim(),
        category: category.value.trim(),
        status,
      }),
    })

    if (res.ok) {
      if (triggerToast) triggerToast(`Article successfully updated and set to ${status === 'publish' ? 'Published' : 'Draft'}`)
      router.push('/')
    } else {
      const errData = await res.json()
      if (errData.errors) {
        validationErrors.value = errData.errors
      }
      const errMsg = errData.error || 'Failed to update article'
      if (triggerToast) triggerToast(errMsg, 'error')
    }
  } catch (error) {
    if (triggerToast) triggerToast('Server is unreachable', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchArticleDetails()
})
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto;">
    <div class="header-section">
      <div>
        <h1 class="page-title">Edit Article</h1>
        <p class="page-subtitle">Modify article fields and update its publish status</p>
      </div>
      <button @click="router.push('/')" class="btn btn-secondary">
        Cancel
      </button>
    </div>

    <div class="card">
      <div v-if="loading" class="empty-state">
        <div class="empty-text">Loading article details...</div>
      </div>
      <form v-else @submit.prevent>
        <!-- Title Input -->
        <div class="form-group">
          <label class="form-label" for="title">Title</label>
          <input 
            v-model="title" 
            type="text" 
            id="title" 
            class="form-control" 
            placeholder="Minimum 20 characters..."
            :class="{ 'border-success': isTitleValid && title.length > 0 }"
          />
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
            <span class="form-error" v-if="validationErrors.title">{{ validationErrors.title }}</span>
            <span v-else></span>
            <span style="font-size: 0.75rem; color: var(--text-muted);" :style="{ color: isTitleValid ? '#34d399' : '#f87171' }">
              {{ title.length }} / 20 chars min
            </span>
          </div>
        </div>

        <!-- Category Input -->
        <div class="form-group">
          <label class="form-label" for="category">Category</label>
          <input 
            v-model="category" 
            type="text" 
            id="category" 
            class="form-control" 
            placeholder="Minimum 3 characters..."
            :class="{ 'border-success': isCategoryValid && category.length > 0 }"
          />
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
            <span class="form-error" v-if="validationErrors.category">{{ validationErrors.category }}</span>
            <span v-else></span>
            <span style="font-size: 0.75rem; color: var(--text-muted);" :style="{ color: isCategoryValid ? '#34d399' : '#f87171' }">
              {{ category.length }} / 3 chars min
            </span>
          </div>
        </div>

        <!-- Content TextArea -->
        <div class="form-group">
          <label class="form-label" for="content">Content</label>
          <textarea 
            v-model="content" 
            id="content" 
            class="form-control" 
            placeholder="Write article content here (Minimum 200 characters)..."
            :class="{ 'border-success': isContentValid && content.length > 0 }"
          ></textarea>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
            <span class="form-error" v-if="validationErrors.content">{{ validationErrors.content }}</span>
            <span v-else></span>
            <span style="font-size: 0.75rem; color: var(--text-muted);" :style="{ color: isContentValid ? '#34d399' : '#f87171' }">
              {{ content.length }} / 200 chars min
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button 
            type="button" 
            @click="handleUpdate('draft')" 
            class="btn btn-secondary" 
            :disabled="submitting"
          >
            Save as Draft
          </button>
          <button 
            type="button" 
            @click="handleUpdate('publish')" 
            class="btn btn-primary" 
            :disabled="submitting"
          >
            {{ submitting ? 'Updating...' : 'Publish' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.border-success {
  border-color: var(--success) !important;
}
</style>
