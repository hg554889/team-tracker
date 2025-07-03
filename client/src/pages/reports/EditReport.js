// client/src/pages/reports/EditReport.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import Spinner from '../../components/layout/Spinner';

const EditReport = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    weekNumber: 1,
    startDate: '',
    endDate: '',
    goals: '',
    progress: '',
    challenges: '',
    nextWeekPlan: '',
    completionRate: 0,
    status: 'not_started'
  });
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/${id}`);
      const reportData = response.data;
      
      // Check if user can edit this report
      if (!canEditReport(reportData)) {
        setAlert('이 보고서를 수정할 권한이 없습니다.', 'danger');
        navigate(`/reports/${id}`);
        return;
      }
      
      setReport(reportData);
      setFormData({
        weekNumber: reportData.weekNumber,
        startDate: reportData.startDate.split('T')[0],
        endDate: reportData.endDate.split('T')[0],
        goals: reportData.goals || '',
        progress: reportData.progress || '',
        challenges: reportData.challenges || '',
        nextWeekPlan: reportData.nextWeekPlan || '',
        completionRate: reportData.completionRate || 0,
        status: reportData.status || 'not_started'
      });
    } catch (error) {
      console.error('Report fetch error:', error);
      setAlert('보고서를 불러오는데 실패했습니다.', 'danger');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const canEditReport = (reportData) => {
    if (!reportData || !user) return false;
    return user.role === 'admin' || 
           user.role === 'executive' || 
           reportData.submittedBy?._id === user._id ||
           reportData.team?.leader?._id === user._id;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Week number validation
    if (!formData.weekNumber || formData.weekNumber < 1) {
      errors.weekNumber = '올바른 주차를 입력해주세요.';
    }

    // Date validation
    if (!formData.startDate) {
      errors.startDate = '시작일을 선택해주세요.';
    }
    if (!formData.endDate) {
      errors.endDate = '종료일을 선택해주세요.';
    }
    if (formData.startDate && formData.endDate && 
        new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.endDate = '종료일은 시작일보다 늦어야 합니다.';
    }

    // Goals validation
    if (!formData.goals.trim()) {
      errors.goals = '목표를 입력해주세요.';
    } else if (formData.goals.length > 1000) {
      errors.goals = '목표는 1000글자를 초과할 수 없습니다.';
    }

    // Completion rate validation
    if (formData.completionRate < 0 || formData.completionRate > 100) {
      errors.completionRate = '완료율은 0-100 사이의 값이어야 합니다.';
    }

    // Content length validation
    if (formData.progress && formData.progress.length > 2000) {
      errors.progress = '진행상황은 2000글자를 초과할 수 없습니다.';
    }
    if (formData.challenges && formData.challenges.length > 2000) {
      errors.challenges = '어려움/이슈는 2000글자를 초과할 수 없습니다.';
    }
    if (formData.nextWeekPlan && formData.nextWeekPlan.length > 2000) {
      errors.nextWeekPlan = '다음 주 계획은 2000글자를 초과할 수 없습니다.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert('입력 정보를 확인해주세요.', 'danger');
      return;
    }

    setSaving(true);
    
    try {
      const updateData = {
        weekNumber: formData.weekNumber,
        startDate: formData.startDate,
        endDate: formData.endDate,
        goals: formData.goals.trim(),
        progress: formData.progress.trim(),
        challenges: formData.challenges.trim(),
        nextWeekPlan: formData.nextWeekPlan.trim(),
        completionRate: formData.completionRate,
        status: formData.status
      };

      await api.put(`/reports/${id}`, updateData);
      
      setAlert('보고서가 성공적으로 수정되었습니다!', 'success');
      navigate(`/reports/${id}`);
    } catch (error) {
      console.error('Report update error:', error);
      const message = error.response?.data?.message || '보고서 수정에 실패했습니다.';
      setAlert(message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('수정 중인 내용이 사라집니다. 정말로 취소하시겠습니까?')) {
      navigate(`/reports/${id}`);
    }
  };

  const hasChanges = () => {
    if (!report) return false;
    return (
      formData.weekNumber !== report.weekNumber ||
      formData.startDate !== report.startDate.split('T')[0] ||
      formData.endDate !== report.endDate.split('T')[0] ||
      formData.goals !== (report.goals || '') ||
      formData.progress !== (report.progress || '') ||
      formData.challenges !== (report.challenges || '') ||
      formData.nextWeekPlan !== (report.nextWeekPlan || '') ||
      formData.completionRate !== (report.completionRate || 0) ||
      formData.status !== (report.status || 'not_started')
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in_progress': return '진행 중';
      case 'not_started': return '시작 전';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
        <h4 className="text-muted">보고서를 찾을 수 없습니다</h4>
        <Link to="/reports" className="btn btn-primary">보고서 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="edit-report">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center mb-2">
            <Link to={`/reports/${id}`} className="btn btn-outline-secondary btn-sm mr-3">
              <i className="fas fa-arrow-left mr-2"></i>
              보고서 상세
            </Link>
            <h1>보고서 수정</h1>
          </div>
          <p className="text-muted mb-0">
            <strong>{report.team?.name || 'Unknown Team'}</strong> - {report.weekNumber}주차 보고서를 수정합니다.
          </p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={handleCancel}
        >
          <i className="fas fa-times mr-2"></i>
          취소
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">기본 정보</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="weekNumber" className="form-label">
                        주차 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${validationErrors.weekNumber ? 'is-invalid' : ''}`}
                        id="weekNumber"
                        name="weekNumber"
                        value={formData.weekNumber}
                        onChange={handleInputChange}
                        min="1"
                        max="52"
                      />
                      {validationErrors.weekNumber && (
                        <div className="invalid-feedback">{validationErrors.weekNumber}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="startDate" className="form-label">
                        시작일 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${validationErrors.startDate ? 'is-invalid' : ''}`}
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                      {validationErrors.startDate && (
                        <div className="invalid-feedback">{validationErrors.startDate}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="endDate" className="form-label">
                        종료일 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${validationErrors.endDate ? 'is-invalid' : ''}`}
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                      {validationErrors.endDate && (
                        <div className="invalid-feedback">{validationErrors.endDate}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="status" className="form-label">상태</label>
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="not_started">시작 전</option>
                        <option value="in_progress">진행 중</option>
                        <option value="completed">완료</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="completionRate" className="form-label">
                        완료율 (%)
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="range"
                          className="form-range flex-grow-1 mr-3"
                          id="completionRate"
                          name="completionRate"
                          value={formData.completionRate}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          step="5"
                        />
                        <span className="badge badge-primary">{formData.completionRate}%</span>
                      </div>
                      {validationErrors.completionRate && (
                        <div className="text-danger mt-1">{validationErrors.completionRate}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">보고서 내용</h5>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="goals" className="form-label">
                    이번 주 목표 <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${validationErrors.goals ? 'is-invalid' : ''}`}
                    id="goals"
                    name="goals"
                    rows="3"
                    value={formData.goals}
                    onChange={handleInputChange}
                    placeholder="이번 주에 달성하고자 하는 목표를 구체적으로 작성해주세요"
                    maxLength={1000}
                  />
                  {validationErrors.goals && (
                    <div className="invalid-feedback">{validationErrors.goals}</div>
                  )}
                  <small className="form-text text-muted">
                    {formData.goals.length}/1000 글자
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="progress" className="form-label">진행상황</label>
                  <textarea
                    className={`form-control ${validationErrors.progress ? 'is-invalid' : ''}`}
                    id="progress"
                    name="progress"
                    rows="4"
                    value={formData.progress}
                    onChange={handleInputChange}
                    placeholder="현재까지의 진행상황을 상세히 작성해주세요"
                    maxLength={2000}
                  />
                  {validationErrors.progress && (
                    <div className="invalid-feedback">{validationErrors.progress}</div>
                  )}
                  <small className="form-text text-muted">
                    {formData.progress.length}/2000 글자
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="challenges" className="form-label">어려움 및 이슈</label>
                  <textarea
                    className={`form-control ${validationErrors.challenges ? 'is-invalid' : ''}`}
                    id="challenges"
                    name="challenges"
                    rows="3"
                    value={formData.challenges}
                    onChange={handleInputChange}
                    placeholder="겪고 있는 어려움이나 해결이 필요한 이슈를 작성해주세요"
                    maxLength={2000}
                  />
                  {validationErrors.challenges && (
                    <div className="invalid-feedback">{validationErrors.challenges}</div>
                  )}
                  <small className="form-text text-muted">
                    {formData.challenges.length}/2000 글자
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="nextWeekPlan" className="form-label">다음 주 계획</label>
                  <textarea
                    className={`form-control ${validationErrors.nextWeekPlan ? 'is-invalid' : ''}`}
                    id="nextWeekPlan"
                    name="nextWeekPlan"
                    rows="3"
                    value={formData.nextWeekPlan}
                    onChange={handleInputChange}
                    placeholder="다음 주에 진행할 계획을 작성해주세요"
                    maxLength={2000}
                  />
                  {validationErrors.nextWeekPlan && (
                    <div className="invalid-feedback">{validationErrors.nextWeekPlan}</div>
                  )}
                  <small className="form-text text-muted">
                    {formData.nextWeekPlan.length}/2000 글자
                  </small>
                </div>
              </div>
            </div>

            {/* Changes Summary */}
            {hasChanges() && (
              <div className="card mt-4">
                <div className="card-header bg-warning text-dark">
                  <h6 className="mb-0">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    변경사항 확인
                  </h6>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-2">다음 내용이 변경됩니다:</p>
                  <ul className="list-unstyled">
                    {formData.weekNumber !== report.weekNumber && (
                      <li>
                        <strong>주차:</strong> 
                        <span className="text-muted ml-1">{report.weekNumber}주차</span> 
                        <i className="fas fa-arrow-right mx-2"></i>
                        <span className="text-primary">{formData.weekNumber}주차</span>
                      </li>
                    )}
                    {formData.status !== report.status && (
                      <li>
                        <strong>상태:</strong> 
                        <span className="text-muted ml-1">{getStatusDisplayName(report.status)}</span> 
                        <i className="fas fa-arrow-right mx-2"></i>
                        <span className="text-primary">{getStatusDisplayName(formData.status)}</span>
                      </li>
                    )}
                    {formData.completionRate !== (report.completionRate || 0) && (
                      <li>
                        <strong>완료율:</strong> 
                        <span className="text-muted ml-1">{report.completionRate || 0}%</span> 
                        <i className="fas fa-arrow-right mx-2"></i>
                        <span className="text-primary">{formData.completionRate}%</span>
                      </li>
                    )}
                    {(formData.goals !== (report.goals || '') ||
                      formData.progress !== (report.progress || '') ||
                      formData.challenges !== (report.challenges || '') ||
                      formData.nextWeekPlan !== (report.nextWeekPlan || '')) && (
                      <li>
                        <strong>보고서 내용:</strong> 수정됨
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-secondary mr-3"
                onClick={handleCancel}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !hasChanges()}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    변경사항 저장
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '2rem' }}>
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-info-circle mr-2"></i>
                보고서 정보
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>현재 정보</h6>
                <ul className="list-unstyled">
                  <li><strong>팀:</strong> {report.team?.name || 'Unknown Team'}</li>
                  <li><strong>주차:</strong> {report.weekNumber}주차</li>
                  <li><strong>기간:</strong> 
                    <span className="d-block mt-1">
                      {formatDate(report.startDate)} ~<br/>
                      {formatDate(report.endDate)}
                    </span>
                  </li>
                  <li><strong>상태:</strong> {getStatusDisplayName(report.status)}</li>
                  <li><strong>완료율:</strong> {report.completionRate || 0}%</li>
                  <li><strong>작성자:</strong> {report.submittedBy?.name || 'Unknown'}</li>
                </ul>
              </div>
              
              <div className="alert alert-info">
                <small>
                  <i className="fas fa-info-circle mr-2"></i>
                  <strong>수정 안내:</strong><br/>
                  • 보고서 수정 시 수정일이 업데이트됩니다<br/>
                  • 팀 멤버들이 변경사항을 확인할 수 있습니다<br/>
                  • 완료율과 상태는 팀 진행률에 반영됩니다
                </small>
              </div>

              <div className="mt-3">
                <Link 
                  to={`/reports/${id}`}
                  className="btn btn-outline-primary btn-block btn-sm"
                >
                  <i className="fas fa-eye mr-2"></i>
                  보고서 상세 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-range {
          -webkit-appearance: none;
          width: 100%;
          height: 0.5rem;
          border-radius: 0.25rem;
          background: #e9ecef;
          outline: none;
        }
        
        .form-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          background: #0366d6;
          cursor: pointer;
        }
        
        .form-range::-moz-range-thumb {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          background: #0366d6;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default EditReport;