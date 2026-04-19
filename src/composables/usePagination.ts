export function usePagination(fetchDataCallback: () => void | Promise<void>) {
  // Element Plus uses 1-based indexing for the UI
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalElements = ref(0)

  // Spring Boot uses 0-based indexing for the API
  const apiPage = computed(() => currentPage.value - 1)

  const handleSizeChange = (val: number) => {
    pageSize.value = val
    currentPage.value = 1
    fetchDataCallback()
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
    fetchDataCallback()
  }

  const setTotal = (total: number) => {
    totalElements.value = total
  }

  return{
    currentPage,
    pageSize,
    totalElements,
    apiPage,
    handleSizeChange,
    handleCurrentChange,
    setTotal
  }
}
