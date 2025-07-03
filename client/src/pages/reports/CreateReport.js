// client/src/pages/reports/CreateReport.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import Spinner from '../../components/layout/Spinner';

const CreateReport = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    team: searchParams.get('team') || '',
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
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchTeams();
    setDefaultDates();
  }, []);

  const fetchTeams = async () => {
    try {
      setTeamsLoading(true);
      const response = await api.get('/teams');
      // Filter teams where user is member or leader (or admin/executive can see all)
      const userTeams = (response.data || []).filter(team => 
        user?.role === 'admin' || 
        user?.role === 'executive' ||
        team.leader?._id === user?._id ||
        team.members?.some(member => member._id === user?._id)
      );
      setTeams(userTeams);
      
      // If team is pre-selected from URL but not in user's teams, redirect
      if (searchParams.get('team') && !userTeams.find(t => t._id === searchParams.get('team'))) {
        setAlert('해당 팀에 대한 권한이 없습니다.', 'warning');
        navigate('/reports');
      }
    } catch (error) {
      console.error('Teams fetch error:', error);
      setAlert('팀 목록을 불러오는데 실패했습니다.', 'danger');
    } finally {
      setTeamsLoading(false);
    }
  };

  const setDefaultDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // This week's Monday
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // This week's Sunday
    
    setFormData(prev => ({
      ...prev,
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0]
    }));
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

  const handleTeamChange = async (e) => {
    const teamId = e.target.value;
    setFormData(prev => ({ ...prev, team: teamId }));
    
    if (teamId) {
      // Get next week number for this team
      try {
        const response = await api.get(`/teams/${teamId}/reports`);
        const teamReports = response.data || [];
        const maxWeekNumber = teamReports.length > 0 ? 
          Math.max(...teamReports.map(r => r.weekNumber)) : 0;
        
        setFormData(prev => ({
          ...prev,
          weekNumber: maxWeekNumber + 1
        }));
      } catch (error) {
        console.error('Error fetching team reports:', error);
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    // Team validation
    if (!formData.team) {
      errors.team = '팀을 선택해주세요.';
    }

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

    setLoading(true);
    
    try {
      const reportData = {
        team: formData.team,
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

      const response = await api.post(`/teams/${formData.team}/reports`, reportData);
      
      setAlert('보고서가 성공적으로 작성되었습니다!', 'success');
      navigate(`/reports/${response.data._id}`);
    } catch (error) {
      console.error('Report creation error:', error);
      const message = error.response?.data?.message || '보고서 작성에 실패했습니다.';
      setAlert(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말로 취소하시겠습니까?')) {
      navigate('/reports');
    }
  };

  const getSelectedTeam = () => {
    return teams.find(team => team._id === formData.team);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (teamsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-users fa-3x text-muted mb-3"></i>
        <h4 className="text-muted">소속된 팀이 없습니다</h4>
        <p className="text-muted mb-3">
          보고서를 작성하려면 먼저 팀에 소속되어야 합니다.
        </p>
        <button 
          className="btn btn-secondary mr-2"
          onClick={() => navigate('/teams')}
        >
          팀 목록 보기
        </button>
        {['admin', 'executive', 'leader'].includes(user?.role) && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/teams/create')}
          >
            새 팀 생성
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="create-report">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>새 보고서 작성</h1>
          <p className="text-muted mb-0">
            팀의 주간 활동 보고서를 작성합니다.
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
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="team" className="form-label">
                        팀 <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${validationErrors.team ? 'is-invalid' : ''}`}
                        id="team"
                        name="team"
                        value={formData.team}
                        onChange={handleTeamChange}
                      >
                        <option value="">팀을 선택하세요</option>
                        {teams.map(team => (
                          <option key={team._id} value={team._id}>
                            {team.name} ({team.type === 'study' ? '스터디' : '프로젝트'})
                          </option>
                        ))}
                      </select>
                      {validationErrors.team && (
                        <div className="invalid-feedback">{validationErrors.team}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
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
                </div>

                <div className="row">
                  <div className="col-md-6">
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
                  
                  <div className="col-md-6">
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

            {/* Submit Buttons */}
            <div className="d-flex justify-content-end">
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    작성 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    보고서 저장
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
                <h6>작성 정보</h6>
                <ul className="list-unstyled">
                  <li><strong>팀:</strong> {getSelectedTeam()?.name || '(미선택)'}</li>
                  <li><strong>주차:</strong> {formData.weekNumber}주차</li>
                  <li><strong>기간:</strong> 
                    {formData.startDate && formData.endDate ? (
                      <span className="d-block mt-1">
                        {formatDate(formData.startDate)} ~<br/>
                        {formatDate(formData.endDate)}
                      </span>
                    ) : '(미설정)'}
                  </li>
                  <li><strong>완료율:</strong> {formData.completionRate}%</li>
                </ul>
              </div>
              
              <div className="alert alert-info">
                <small>
                  <i className="fas fa-lightbulb mr-2"></i>
                  <strong>작성 팁:</strong><br/>
                  • 구체적인 수치와 결과 포함<br/>
                  • 어려움은 해결방안과 함께 작성<br/>
                  • 다음 주 계획은 실현 가능하게 설정
                </small>
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

export default CreateReport;