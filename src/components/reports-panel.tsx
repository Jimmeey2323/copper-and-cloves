import { useState } from 'react';
import {
  reportsAPI,
  type DailyVisitorsReport,
  type DailySalesReport,
  type PerformanceReport,
} from '@/lib/reports-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Activity,
  MapPin,
  UserCheck,
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from './ui/date-range-picker';
import { Label } from '@/components/ui/label';

type ReportType = 'dailyVisitors' | 'dailySales' | 'performance';

export function ReportsPanel() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [location, setLocation] = useState('all');
  const [trainer, setTrainer] = useState('all');
  const [reportType, setReportType] = useState<ReportType>('dailyVisitors');
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setGeneratedReport(null);
    try {
      let reportData;
      const startDate = dateRange?.from?.toISOString().split('T')[0];
      const endDate = dateRange?.to?.toISOString().split('T')[0];

      switch (reportType) {
        case 'dailyVisitors':
          reportData = await reportsAPI.getDailyVisitorsReport(
            startDate || new Date().toISOString().split('T')[0]
          );
          break;
        case 'dailySales':
          reportData = await reportsAPI.getDailySalesReport(
            startDate || new Date().toISOString().split('T')[0]
          );
          break;
        case 'performance':
          reportData = await reportsAPI.getPerformanceReport();
          break;
        default:
          throw new Error('Invalid report type');
      }
      setGeneratedReport(reportData);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${dateRange?.from?.toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderReport = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-10">
          <LoadingSpinner />
        </div>
      );
    }

    if (!generatedReport) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p>Select your filters and generate a report to view details.</p>
        </div>
      );
    }

    switch (reportType) {
      case 'dailyVisitors':
        return <DailyVisitorsReportComponent report={generatedReport} downloadCSV={downloadCSV} />;
      case 'dailySales':
        return <DailySalesReportComponent report={generatedReport} downloadCSV={downloadCSV} />;
      case 'performance':
        return <PerformanceReportComponent report={generatedReport} downloadCSV={downloadCSV} />;
      default:
        return null;
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="flex items-center"><Calendar className="w-4 h-4 mr-2" />Date Range</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center"><MapPin className="w-4 h-4 mr-2" />Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="36372">Copper & Cloves Studio</SelectItem>
                  {/* Add other locations here */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center"><UserCheck className="w-4 h-4 mr-2" />Trainer</Label>
              <Select value={trainer} onValueChange={setTrainer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trainer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trainers</SelectItem>
                  {/* Populate with actual trainer data */}
                  <SelectItem value="trainer1">John Doe</SelectItem>
                  <SelectItem value="trainer2">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center"><Activity className="w-4 h-4 mr-2" />Report Type</Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dailyVisitors">Daily Visitors</SelectItem>
                  <SelectItem value="dailySales">Daily Sales</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {renderReport()}
    </div>
  );
}

// --- Report Components ---

function DailyVisitorsReportComponent({ report, downloadCSV }: { report: DailyVisitorsReport, downloadCSV: Function }) {
  return (
    <Card className="shadow-lg border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Daily Visitors Report</span>
            <Badge variant="secondary">{report.totalVisitors} visitors</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(report.visitors, 'daily-visitors')}>
            <FileDown className="w-4 h-4 mr-1" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Member</th>
                <th className="text-left p-3 font-medium">Check-in Time</th>
                <th className="text-left p-3 font-medium">Session</th>
                <th className="text-left p-3 font-medium">Trainer</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.visitors.map((visitor) => (
                <tr key={visitor.id} className="border-b hover:bg-gray-50/50">
                  <td className="p-3">{visitor.memberName}</td>
                  <td className="p-3">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {visitor.checkInTime}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={visitor.sessionType === 'class' ? 'default' : 'secondary'}>
                      {visitor.className || visitor.sessionType}
                    </Badge>
                  </td>
                  <td className="p-3">{visitor.trainer || 'N/A'}</td>
                  <td className="p-3">
                    <Badge variant={visitor.status === 'completed' ? 'default' : 'destructive'}>
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
  );
}

function DailySalesReportComponent({ report, downloadCSV }: { report: DailySalesReport, downloadCSV: Function }) {
  return (
    <Card className="shadow-lg border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <IndianRupee className="w-5 h-5 text-green-500" />
            <span>Daily Sales Report</span>
            <Badge variant="secondary">₹{report.sales.totalRevenue}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => downloadCSV([report.sales], 'daily-sales')}>
            <FileDown className="w-4 h-4 mr-1" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50 border-l-4 border-green-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-700">₹{report.sales.totalRevenue}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-l-4 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Total Visits</p>
              <p className="text-3xl font-bold text-blue-700">{report.sales.totalVisits}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-l-4 border-purple-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Revenue per Visit</p>
              <p className="text-3xl font-bold text-purple-700">₹{report.sales.revenuePerVisit}</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Revenue Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded-md bg-gray-50">
                <span>Classes:</span>
                <span className="font-medium">₹{report.sales.classRevenue}</span>
              </div>
              <div className="flex justify-between p-2 rounded-md bg-gray-50">
                <span>Personal Training:</span>
                <span className="font-medium">₹{report.sales.personalTrainingRevenue}</span>
              </div>
              <div className="flex justify-between p-2 rounded-md bg-gray-50">
                <span>Memberships:</span>
                <span className="font-medium">₹{report.sales.membershipRevenue}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Visit Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded-md bg-gray-50">
                <span>Classes:</span>
                <span className="font-medium">{report.sales.visitBreakdown.classes}</span>
              </div>
              <div className="flex justify-between p-2 rounded-md bg-gray-50">
                <span>Personal Training:</span>
                <span className="font-medium">{report.sales.visitBreakdown.personalTraining}</span>
              </div>
              <div className="flex justify-between p-2 rounded-md bg-gray-50">
                <span>Open Gym:</span>
                <span className="font-medium">{report.sales.visitBreakdown.openGym}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceReportComponent({ report, downloadCSV }: { report: PerformanceReport, downloadCSV: Function }) {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-l-4 border-l-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-orange-500" />
              <span>Trainer Performance</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => downloadCSV(report.trainers, 'trainer-performance')}>
              <FileDown className="w-4 h-4 mr-1" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Trainer</th>
                  <th className="text-left p-3 font-medium">Classes</th>
                  <th className="text-left p-3 font-medium">Total Students</th>
                  <th className="text-left p-3 font-medium">Avg. Attendance</th>
                  <th className="text-left p-3 font-medium">Revenue</th>
                  <th className="text-left p-3 font-medium">Rating</th>
                  <th className="text-left p-3 font-medium">Specialties</th>
                </tr>
              </thead>
              <tbody>
                {report.trainers.map((trainer) => (
                  <tr key={trainer.trainerId} className="border-b hover:bg-gray-50/50">
                    <td className="p-3 font-medium">{trainer.trainerName}</td>
                    <td className="p-3">{trainer.classesThisMonth}</td>
                    <td className="p-3">{trainer.totalStudents}</td>
                    <td className="p-3">{trainer.averageAttendance.toFixed(1)}</td>
                    <td className="p-3">₹{trainer.revenue.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <span className="mr-1 text-yellow-500">⭐</span>
                        {trainer.rating}
                      </div>
                    </td>
                    <td className="p-3">
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

      <Card className="shadow-lg border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span>Class Performance</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => downloadCSV(report.classes, 'class-performance')}>
              <FileDown className="w-4 h-4 mr-1" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Class</th>
                  <th className="text-left p-3 font-medium">Trainer</th>
                  <th className="text-left p-3 font-medium">Capacity</th>
                  <th className="text-left p-3 font-medium">Avg. Attendance</th>
                  <th className="text-left p-3 font-medium">Attendance Rate</th>
                  <th className="text-left p-3 font-medium">Revenue</th>
                  <th className="text-left p-3 font-medium">Popularity</th>
                </tr>
              </thead>
              <tbody>
                {report.classes.map((classItem) => (
                  <tr key={classItem.classId} className="border-b hover:bg-gray-50/50">
                    <td className="p-3 font-medium">{classItem.className}</td>
                    <td className="p-3">{classItem.trainer}</td>
                    <td className="p-3">{classItem.capacity}</td>
                    <td className="p-3">{classItem.averageAttendance.toFixed(1)}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${classItem.attendanceRate}%` }}
                          ></div>
                        </div>
                        {classItem.attendanceRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-3">₹{classItem.revenue.toLocaleString()}</td>
                    <td className="p-3">
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
  );
}