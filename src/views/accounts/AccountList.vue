<script setup lang="ts">
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import type { AccountDto } from '@/types/account'
import { usePagination } from '@/composables/usePagination.ts'
import { createAccount, deleteAccount, getAccounts, updateAccount } from '@/api/account.ts'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import MD5 from 'crypto-js/md5'

// --- State ---
const loading = ref(false)
const tableData = ref<AccountDto[]>([])

// --- Pagination ---
const {
  currentPage,
  pageSize,
  totalElements,
  apiPage,
  handleSizeChange,
  handleCurrentChange,
  setTotal,
} = usePagination(fetchData)

// --- Fetch Data ---
async function fetchData() {
  loading.value = true
  try {
    const res = await getAccounts({ page: apiPage.value, size: pageSize.value })
    tableData.value = res.content
    setTotal(res.totalElements)
  } catch {
  } finally {
    loading.value = false
  }
}

// --- Dialog State ---
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const currentEditId = ref<number | null>(null)

const formData = reactive({
  phone: '',
  nickname: '',
  password: '',
})

const formRules = computed<FormRules>(() => {
  if (dialogMode.value === 'create') {
    return {
      phone: [
        { required: true, message: 'Phone is required', trigger: 'blur' },
        { min: 5, max: 15, message: 'Length must be 5 to 15', trigger: 'blur' },
      ],
      nickname: [
        { required: true, message: 'Nickname is required', trigger: 'blur' },
        { min: 2, max: 30, message: 'Length must be 2 to 30', trigger: 'blur' },
      ],
      password: [
        { required: true, message: 'Password is required', trigger: 'blur' },
        { min: 6, max: 12, message: 'Length must be 6 to 12', trigger: 'blur' },
      ],
    }
  } else {
    return {
      password: [
        { required: true, message: 'Password is required', trigger: 'blur' },
        { min: 6, max: 12, message: 'Length must be 6 to 12', trigger: 'blur' },
      ],
    }
  }
})

// --- Actions ---
const openDialog = (mode: 'create' | 'edit', row?: AccountDto) => {
  dialogMode.value = mode
  dialogVisible.value = true

  formData.phone = ''
  formData.nickname = ''
  formData.password = ''

  if (mode === 'edit' && row) {
    currentEditId.value = row.id
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (dialogMode.value === 'create') {
        await createAccount({
          phone: formData.phone,
          nickname: formData.nickname,
          password: MD5(formData.password).toString(),
        })
        ElMessage.success('Account created successfully')
      } else if (dialogMode.value === 'edit' && currentEditId.value) {
        await updateAccount(currentEditId.value, {
          password: formData.password,
        })
        ElMessage.success('Account updated successfully')
      }
      dialogVisible.value = false
      await fetchData()
    } catch {
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDelete = (row: AccountDto) => {
  ElMessageBox.confirm(`Are you sure you want to delete account ${row.userName}?`, 'Warning', {
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteAccount(row.id)
        ElMessage.success('Account deleted successfully')

        if (tableData.value.length === 1 && currentPage.value > 1) {
          currentPage.value -= 1
        } else {
          await fetchData()
        }
      } catch {}
    })
    .catch(() => {})
}

// --- Lifecycle ---
onMounted(() => {
  void fetchData()
})
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <!-- Header Actions -->
    <el-card class="shadow-sm border-0">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold text-gray-800">Account Management</h2>
        <el-button type="primary" :icon="Plus" @click="openDialog('create')">
          Add Account
        </el-button>
      </div>
    </el-card>

    <!-- Data Table -->
    <el-card
      class="shadow-sm border-0 flex flex-col"
      body-class="flex-1 flex flex-col p-0 overflow-hidden"
    >
      <div class="flex-1 p-4 overflow-hidden">
        <el-table :data="tableData" v-loading="loading" height="100%" stripe border>
          <el-table-column prop="id" label="ID" width="100" align="center" />
          <el-table-column prop="userName" label="Username" min-width="180" />
          <el-table-column prop="phone" label="Phone" min-width="150" />

          <el-table-column label="Actions" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link- :icon="Edit" @click="openDialog('edit', row)">
                Edit
              </el-button>
              <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-gray-100 flex justify-end bg-white">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalElements"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? 'Create Account' : 'Edit Account'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        @keyup.enter="handleSubmit"
      >
        <template v-if="dialogMode === 'create'">
          <el-form-item label="Phone" prop="phone">
            <el-input v-model="formData.phone" placeholder="Enter phone number" />
          </el-form-item>
          <el-form-item label="Nickname" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="Enter nickname" />
          </el-form-item>
        </template>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="Enter password"
            show-password
          />
          <div class="text-xs text-gray-400 mt-1 leading-tight">
            <span v-if="dialogMode === 'create'">Will be MD5 hashed before sending.</span>
            <span v-else>Must be 6-12 characters.</span>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
