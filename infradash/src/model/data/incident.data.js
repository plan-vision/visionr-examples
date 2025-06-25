module.exports = [
    {
        id: 1,
        code: 'INC-CPU-001',
        server: 1, // Placeholder server ID
        name: { "en-US": "CPU Spike" },
        description: { "en-US": "Unexpected CPU utilization spike." },
        status: 'open',
        severity: 'high',
        reported_date: '2025-06-20T10:00:00Z',
        reported_data: JSON.stringify({
            cpu_usage: "95%",
            process: "httpd",
            timestamp: "2025-06-20T09:58:00Z"
        })
    },
    {
        id: 2,
        code: 'INC-DSK-002',
        server: 2, // Placeholder server ID
        name: { "en-US": "Disk Space Low" },
        description: { "en-US": "Disk space critically low." },
        status: 'in_progress',
        severity: 'critical',
        reported_date: '2025-06-21T14:30:00Z',
        reported_data: JSON.stringify({
            disk_free: "1GB",
            total_disk: "500GB",
            filesystem: "/dev/sda1"
        })
    },
    {
        id: 3,
        code: 'INC-NET-003',
        server: 1, // Placeholder server ID
        name: { "en-US": "Network Latency" },
        description: { "en-US": "Intermittent network latency." },
        status: 'resolved',
        severity: 'medium',
        reported_date: '2025-06-19T09:15:00Z',
        reported_data: JSON.stringify({
            ping_avg_ms: "250ms",
            packet_loss: "10%",
            destination_ip: "192.168.1.1"
        })
    }
];
