'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  getAuditLogs, 
  GetAuditLogsParams 
} from '@/app/(admin)/actions/audit-logs';

export function useAuditLogs(params: GetAuditLogsParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => getAuditLogs(params),
  });
}
