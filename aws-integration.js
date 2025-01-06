// Configuración de AWS SDK
AWS.config.region = 'us-east-1'; // Región por defecto
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'TU_IDENTITY_POOL_ID'
});

// Clase para manejar las métricas de CloudWatch
class AWSMetricsManager {
    constructor() {
        this.cloudWatch = new AWS.CloudWatch();
        this.updateInterval = 5000; // Actualizar cada 5 segundos
    }

    // Obtener métricas de CPU
    async getCPUMetrics() {
        const params = {
            MetricName: 'CPUUtilization',
            Namespace: 'AWS/EC2',
            Period: 300,
            Statistics: ['Average'],
            StartTime: new Date(new Date().getTime() - 3600000),
            EndTime: new Date()
        };

        try {
            const data = await this.cloudWatch.getMetricStatistics(params).promise();
            return this.processMetricData(data);
        } catch (error) {
            console.error('Error al obtener métricas de CPU:', error);
            return null;
        }
    }

    // Obtener eventos de seguridad
    async getSecurityEvents() {
        // Implementar lógica para obtener eventos de GuardDuty o SecurityHub
    }

    // Actualizar el dashboard
    updateDashboard() {
        this.getCPUMetrics().then(data => {
            if (data) {
                this.updateMetricChart('cpu-usage', data);
            }
        });

        this.getSecurityEvents().then(events => {
            this.updateSecurityAlerts(events);
        });
    }
}

// Inicializar el dashboard
const metricsManager = new AWSMetricsManager();
setInterval(() => metricsManager.updateDashboard(), metricsManager.updateInterval); 