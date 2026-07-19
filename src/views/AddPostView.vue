<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '../config'

const router = useRouter()
const triggerToast = inject<(msg: string, type?: 'success' | 'error') => void>('triggerToast')

const title = ref('')
const content = ref('')
const category = ref('')
const submitting = ref(false)

const validationErrors = ref<Record<string, string>>({})

// Client-side validations for interactive feedback
const isTitleValid = computed(() => title.value.trim().length >= 20)
const isContentValid = computed(() => content.value.trim().length >= 200)
const isCategoryValid = computed(() => category.value.trim().length >= 3)

const handleSave = async (status: 'publish' | 'draft') => {
  validationErrors.value = {}

  // Local pre-checks
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
    const res = await fetch(`${API_BASE_URL}/article`, {
      method: 'POST',
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
      if (triggerToast) triggerToast(`Article successfully saved as ${status === 'publish' ? 'Published' : 'Draft'}`)
      router.push('/')
    } else {
      const errData = await res.json()
      if (errData.errors) {
        validationErrors.value = errData.errors
      }
      const errMsg = errData.error || 'Failed to save article'
      if (triggerToast) triggerToast(errMsg, 'error')
    }
  } catch (error) {
    if (triggerToast) triggerToast('Server is unreachable', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto;">
    <div class="header-section">
      <div>
        <h1 class="page-title">Add New Post</h1>
        <p class="page-subtitle">Draft a new post or publish it instantly</p>
      </div>
      <button @click="router.push('/')" class="btn btn-secondary">
        Cancel
      </button>
    </div>

    <div class="card">
      <form @submit.prevent>
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
            @click="handleSave('draft')" 
            class="btn btn-secondary" 
            :disabled="submitting"
          >
            Save as Draft
          </button>
          <button 
            type="button" 
            @click="handleSave('publish')" 
            class="btn btn-primary" 
            :disabled="submitting"
          >
            {{ submitting ? 'Publishing...' : 'Publish' }}
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
