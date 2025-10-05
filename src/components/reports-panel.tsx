import { useState } from 'react';
import { 
  reportsAPI, 
  type DailyVisitorsReport, 
  type DailySalesReport, 
  type PerformanceReport 
} from '@/lib/reports-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { 
  FileDown, 
  Calendar, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Award,
  Clock,
  Activity
} from 'lucide-react';

export function ReportsPanel() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dailyVisitors, setDailyVisitors] = useState<DailyVisitorsReport | null>(null);
  const [dailySales, setDailySales] = useState<DailySalesReport | null>(null);
  const [performance, setPerformance] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReports = async () => {
    setLoading(true);
    try {
      const [visitorsData, salesData, performanceData] = await Promise.all([
        reportsAPI.getDailyVisitorsReport(selectedDate),
        reportsAPI.getDailySalesReport(selectedDate),
        reportsAPI.getPerformanceReport()
      ]);

      setDailyVisitors(visitorsData);
      setDailySales(salesData);
      setPerformance(performanceData);
    } catch (error) {
      console.error('Failed to generate reports:', error);
      alert('Failed to generate reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${selectedDate}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = (reportType: string, data: any) => {
    // Simple PDF generation - in production, use jsPDF or similar
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h1>Copper & Cloves Studio - ${reportType}</h1>
      <p>Date: ${selectedDate}</p>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>${reportType} - ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            pre { background: #f3f4f6; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-luxury-gradient font-semibold">Studio Reports & Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <Button
              onClick={handleGenerateReports}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Generate Reports'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Visitors Report */}
      {dailyVisitors && (
        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Daily Visitors Report</span>
                <Badge variant="secondary">{dailyVisitors.totalVisitors} visitors</Badge>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV(dailyVisitors.visitors, 'daily-visitors')}
                >
                  <FileDown className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadPDF('Daily Visitors Report', dailyVisitors)}
                >
                  <FileDown className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-2">Member</th>
                    <th className="text-left p-2">Check-in Time</th>
                    <th className="text-left p-2">Session</th>
                    <th className="text-left p-2">Trainer</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyVisitors.visitors.map((visitor) => (
                    <tr key={visitor.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{visitor.memberName}</td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-gray-400" />
                          {visitor.checkInTime}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={visitor.sessionType === 'class' ? 'default' : 'secondary'}>
                          {visitor.className || visitor.sessionType}
                        </Badge>
                      </td>
                      <td className="p-2">{visitor.trainer || '-'}</td>
                      <td className="p-2">
                        <Badge 
                          variant={visitor.status === 'completed' ? 'default' : 'destructive'}
                        >
                          {visitor.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Sales Report */}
      {dailySales && (
        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-green-500" />
                <span>Daily Sales Report</span>
                <Badge variant="secondary">₹{dailySales.sales.totalRevenue}</Badge>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCSV([dailySales.sales], 'daily-sales')}
                >
                  <FileDown className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadPDF('Daily Sales Report', dailySales)}
                >
                  <FileDown className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">₹{dailySales.sales.totalRevenue}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{dailySales.sales.totalVisits}</div>
                  <div className="text-sm text-gray-600">Total Visits</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">₹{dailySales.sales.revenuePerVisit}</div>
                  <div className="text-sm text-gray-600">Revenue per Visit</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Revenue Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Classes:</span>
                    <span>₹{dailySales.sales.classRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal Training:</span>
                    <span>₹{dailySales.sales.personalTrainingRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memberships:</span>
                    <span>₹{dailySales.sales.membershipRevenue}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Visit Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Classes:</span>
                    <span>{dailySales.sales.visitBreakdown.classes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal Training:</span>
                    <span>{dailySales.sales.visitBreakdown.personalTraining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Open Gym:</span>
                    <span>{dailySales.sales.visitBreakdown.openGym}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Report */}
      {performance && (
        <div className="space-y-4">
          {/* Trainer Performance */}
          <Card className="shadow-lg border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  <span>Trainer Performance</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCSV(performance.trainers, 'trainer-performance')}
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF('Trainer Performance Report', performance.trainers)}
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2">Trainer</th>
                      <th className="text-left p-2">Classes This Month</th>
                      <th className="text-left p-2">Total Students</th>
                      <th className="text-left p-2">Avg Attendance</th>
                      <th className="text-left p-2">Revenue</th>
                      <th className="text-left p-2">Rating</th>
                      <th className="text-left p-2">Specialties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.trainers.map((trainer) => (
                      <tr key={trainer.trainerId} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{trainer.trainerName}</td>
                        <td className="p-2">{trainer.classesThisMonth}</td>
                        <td className="p-2">{trainer.totalStudents}</td>
                        <td className="p-2">{trainer.averageAttendance.toFixed(1)}</td>
                        <td className="p-2">₹{trainer.revenue.toLocaleString()}</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <span className="mr-1">⭐</span>
                            {trainer.rating}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {trainer.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Class Performance */}
          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span>Class Performance</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCSV(performance.classes, 'class-performance')}
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF('Class Performance Report', performance.classes)}
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2">Class Name</th>
                      <th className="text-left p-2">Trainer</th>
                      <th className="text-left p-2">Capacity</th>
                      <th className="text-left p-2">Avg Attendance</th>
                      <th className="text-left p-2">Attendance Rate</th>
                      <th className="text-left p-2">Revenue</th>
                      <th className="text-left p-2">Popularity Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.classes.map((classItem) => (
                      <tr key={classItem.classId} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{classItem.className}</td>
                        <td className="p-2">{classItem.trainer}</td>
                        <td className="p-2">{classItem.capacity}</td>
                        <td className="p-2">{classItem.averageAttendance.toFixed(1)}</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${classItem.attendanceRate}%` }}
                              ></div>
                            </div>
                            {classItem.attendanceRate.toFixed(1)}%
                          </div>
                        </td>
                        <td className="p-2">₹{classItem.revenue.toLocaleString()}</td>
                        <td className="p-2">
                          <Badge variant="outline">#{classItem.popularityRank}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}