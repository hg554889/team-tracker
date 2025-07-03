import React, { useEffect, useState } from 'react';
import { fetchReports } from '../services/api';
import Spinner from '../components/layout/Spinner';
import ReportCard from '../components/report/ReportCard';

function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchReports();
        setReports(res.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2>보고서 목록</h2>
      {loading ? <Spinner /> : (
        <div>
          {reports.length === 0 ? <div>보고서가 없습니다.</div> : (
            reports.map((report) => <ReportCard key={report._id} report={report} />)
          )}
        </div>
      )}
    </div>
  );
}

export default ReportList; 