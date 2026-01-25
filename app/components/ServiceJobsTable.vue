<script setup lang="ts">
import { Table, Button, Tag } from 'ant-design-vue'

defineProps<{
  type: 'pending' | 'processing' | 'completed'
  jobs: any[]
  loading: boolean
  takingJobId?: number | null
}>()

const emit = defineEmits<{
  (e: 'take', job: any): void
  (e: 'complete', job: any): void
  (e: 'view', job: any): void
}>()
</script>

<template>
  <Table
    class="green-table"
    :data-source="jobs"
    :loading="loading"
    row-key="id"
    :scroll="{ x: 1100 }"
    size="middle"
  >
    <!-- INDEX -->
    <Table.Column title="#" width="60">
      <template #default="{ index }">{{ index + 1 }}</template>
    </Table.Column>

    <!-- ================= PENDING ================= -->
    <template v-if="type === 'pending'">
      <Table.Column title="Email" dataIndex="email" />
      <Table.Column title="Phone" dataIndex="phone_number" />
      <Table.Column title="Reg No" dataIndex="registration_number" />
      <Table.Column title="Profile Code" dataIndex="profile_code" />

      <Table.Column title="Status" width="120" align="center">
        <template #default="{ record }">
          <Tag color="orange">{{ record.status?.toUpperCase() || 'PENDING' }}</Tag>
        </template>
      </Table.Column>

      <Table.Column title="Action" width="140" align="center">
        <template #default="{ record }">
          <Button
            size="small"
            type="primary"
            :loading="takingJobId === record.id"
            @click="emit('take', record)"
          >
            Take Job
          </Button>
        </template>
      </Table.Column>
    </template>

    <!-- ================= PROCESSING ================= -->
    <template v-else-if="type === 'processing'">
      <Table.Column title="Email" dataIndex="email" />
      <Table.Column title="Reg No" dataIndex="registration_number" />
      <Table.Column title="Profile Code" dataIndex="profile_code" />

      <Table.Column title="Status" width="120" align="center">
        <Tag color="blue">PROCESSING</Tag>
      </Table.Column>

      <Table.Column title="Action" width="160" align="center">
        <template #default="{ record }">
          <Button type="primary" @click="emit('complete', record)">
            Upload Result
          </Button>
        </template>
      </Table.Column>
    </template>

    <!-- ================= COMPLETED ================= -->
    <template v-else>
      <!-- CUSTOMER -->
      <Table.Column title="Customer" width="220">
        <template #default="{ record }">
          <div class="font-semibold">{{ record.user?.name }}</div>
          <div class="text-xs text-gray-500">{{ record.user?.email }}</div>
        </template>
      </Table.Column>

      <!-- SERVICE -->
      <Table.Column title="Service" dataIndex="service" />

      <!-- STATUS -->
      <Table.Column title="Status" width="120" align="center">
        <template #default="{ record }">
          <Tag :color="record.status === 'approved' ? 'green' : 'blue'">
            {{ record.status?.toUpperCase() }}
          </Tag>
        </template>
      </Table.Column>

      <!-- PAYMENT -->
      <Table.Column title="Payment" width="140" align="center">
        <template #default="{ record }">
          <Tag v-if="record.payment?.is_paid" color="green">💰 PAID</Tag>
          <Tag v-else color="red">⏳ UNPAID</Tag>
        </template>
      </Table.Column>

      <!-- FILE -->
      <Table.Column title="Result File" width="140" align="center">
        <template #default="{ record }">
          <a href="#" @click.prevent="emit('view', record)">
            📄 View
          </a>
        </template>
      </Table.Column>

      <!-- DATE -->
      <Table.Column title="Processed At" width="180">
        <template #default="{ record }">
          {{ new Date(record.processed_at).toLocaleString() }}
        </template>
      </Table.Column>
    </template>

  </Table>
</template>
<style scoped>
.green-table :deep(.ant-table-thead th) {
  background: linear-gradient(#10b981);
  color: white;
  font-weight: 600;
  border: none;
}

.green-table :deep(.ant-table-tbody td) {
  padding: 12px;
}

.green-table :deep(.ant-table-row:hover td) {
  background-color: #ecfdf5;
}
</style>