// client/src/pages/teams/EditTeam.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import Spinner from '../../components/layout/Spinner';

const EditTeam = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'study',
    description: ''
  });
  
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teams/${id}`);
      const teamData = response.data;
      
      // Check if user can edit this team
      if (!canEditTeam(teamData)) {
        setAlert('이 팀을 수정할 권한이 없습니다.', 'danger');
        navigate(`/teams/${id}`);
        return;
      }
      
      setTeam(teamData);
      setFormData({
        name: teamData.name,
        type: teamData.type,
        description: teamData.description || ''
      });
    } catch (error) {
      console.error('Team fetch error:', error);
      setAlert('팀 정보를 불러오는데 실패했습니다.', 'danger');
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const canEditTeam = (teamData) => {
    if (!teamData || !user) return false;
    return user.role === 'admin' || 
           user.role === 'executive' || 
           teamData.leader?._id === user._id;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Name validation
    if (!formData.name.trim()) {
      errors.name = '팀명을 입력해주세요.';
    } else if (formData.name.length < 2) {
      errors.name = '팀명은 최소 2글자 이상이어야 합니다.';
    } else if (formData.name.length > 50) {
      errors.name = '팀명은 50글자를 초과할 수 없습니다.';
    }

    // Type validation
    if (!['study', 'project'].includes(formData.type)) {
      errors.type = '올바른 팀 타입을 선택해주세요.';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      errors.description = '설명은 500글자를 초과할 수 없습니다.';
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
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim()
      };

      await api.put(`/teams/${id}`, updateData);
      
      setAlert('팀 정보가 성공적으로 수정되었습니다!', 'success');
      navigate(`/teams/${id}`);
    } catch (error) {
      console.error('Team update error:', error);
      const message = error.response?.data?.message || '팀 수정에 실패했습니다.';
      setAlert(message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('수정 중인 내용이 사라집니다. 정말로 취소하시겠습니까?')) {
      navigate(`/teams/${id}`);
    }
  };

  const getTeamTypeInfo = (type) => {
    switch (type) {
      case 'study':
        return {
          icon: 'fas fa-book',
          name: '스터디',
          description: '학습과 지식 공유를 목적으로 하는 팀'
        };
      case 'project':
        return {
          icon: 'fas fa-rocket',
          name: '프로젝트',
          description: '실제 프로젝트 개발을 목적으로 하는 팀'
        };
      default:
        return { icon: 'fas fa-users', name: '팀', description: '' };
    }
  };

  const hasChanges = () => {
    if (!team) return false;
    return (
      formData.name !== team.name ||
      formData.type !== team.type ||
      formData.description !== (team.description || '')
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
        <h4 className="text-muted">팀을 찾을 수 없습니다</h4>
        <Link to="/teams" className="btn btn-primary">팀 목록으로 돌아가기</Link>
      </div>
    );
  }

  const typeInfo = getTeamTypeInfo(formData.type);

  return (
    <div className="edit-team">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center mb-2">
            <Link to={`/teams/${id}`} className="btn btn-outline-secondary btn-sm mr-3">
              <i className="fas fa-arrow-left mr-2"></i>
              팀 상세
            </Link>
            <h1>팀 정보 수정</h1>
          </div>
          <p className="text-muted mb-0">
            <strong>{team.name}</strong> 팀의 정보를 수정합니다.
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
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">기본 정보</h5>
              </div>
              <div className="card-body">
                {/* Team Name */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    팀명 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="팀명을 입력하세요"
                    maxLength={50}
                  />
                  {validationErrors.name && (
                    <div className="invalid-feedback">{validationErrors.name}</div>
                  )}
                  <small className="form-text text-muted">
                    {formData.name.length}/50 글자
                  </small>
                </div>

                {/* Team Type */}
                <div className="form-group">
                  <label htmlFor="type" className="form-label">
                    팀 타입 <span className="text-danger">*</span>
                  </label>
                  <div className="row">
                    <div className="col-md-6">
                      <div 
                        className={`card team-type-card ${formData.type === 'study' ? 'border-info' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFormData(prev => ({ ...prev, type: 'study' }))}
                      >
                        <div className="card-body text-center">
                          <input
                            type="radio"
                            name="type"
                            value="study"
                            checked={formData.type === 'study'}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <i className="fas fa-book fa-2x text-info mb-2"></i>
                          <h6>스터디</h6>
                          <small className="text-muted">
                            학습과 지식 공유를 목적으로 하는 팀
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div 
                        className={`card team-type-card ${formData.type === 'project' ? 'border-success' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFormData(prev => ({ ...prev, type: 'project' }))}
                      >
                        <div className="card-body text-center">
                          <input
                            type="radio"
                            name="type"
                            value="project"
                            checked={formData.type === 'project'}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <i className="fas fa-rocket fa-2x text-success mb-2"></i>
                          <h6>프로젝트</h6>
                          <small className="text-muted">
                            실제 프로젝트 개발을 목적으로 하는 팀
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                  {validationErrors.type && (
                    <div className="text-danger mt-2">{validationErrors.type}</div>
                  )}
                </div>

                {/* Team Description */}
                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    팀 설명
                  </label>
                  <textarea
                    className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="팀의 목표, 활동 계획 등을 간단히 설명해주세요"
                    maxLength={500}
                  />
                  {validationErrors.description && (
                    <div className="invalid-feedback">{validationErrors.description}</div>
                  )}
                  <small className="form-text text-muted">
                    {formData.description.length}/500 글자
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
                    {formData.name !== team.name && (
                      <li>
                        <strong>팀명:</strong> 
                        <span className="text-muted ml-1">{team.name}</span> 
                        <i className="fas fa-arrow-right mx-2"></i>
                        <span className="text-primary">{formData.name}</span>
                      </li>
                    )}
                    {formData.type !== team.type && (
                      <li>
                        <strong>타입:</strong> 
                        <span className="text-muted ml-1">
                          {team.type === 'study' ? '스터디' : '프로젝트'}
                        </span> 
                        <i className="fas fa-arrow-right mx-2"></i>
                        <span className="text-primary">
                          {formData.type === 'study' ? '스터디' : '프로젝트'}
                        </span>
                      </li>
                    )}
                    {formData.description !== (team.description || '') && (
                      <li>
                        <strong>설명:</strong> 수정됨
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
                <i className={`${typeInfo.icon} mr-2`}></i>
                팀 정보
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>현재 정보</h6>
                <ul className="list-unstyled">
                  <li><strong>팀명:</strong> {team.name}</li>
                  <li><strong>타입:</strong> {team.type === 'study' ? '스터디' : '프로젝트'}</li>
                  <li><strong>리더:</strong> {team.leader?.name || team.leader?.username || '알 수 없음'}</li>
                  <li><strong>멤버 수:</strong> {(team.members?.length || 0) + 1}명</li>
                  <li><strong>생성일:</strong> {new Date(team.createdAt).toLocaleDateString('ko-KR')}</li>
                </ul>
              </div>
              
              <div className="alert alert-info">
                <small>
                  <i className="fas fa-info-circle mr-2"></i>
                  <strong>수정 안내:</strong><br/>
                  • 팀명과 타입 변경은 모든 멤버에게 알림됩니다<br/>
                  • 기존 보고서에는 영향을 주지 않습니다<br/>
                  • 멤버 관리는 팀 상세 페이지에서 가능합니다
                </small>
              </div>

              <div className="mt-3">
                <Link 
                  to={`/teams/${id}`}
                  className="btn btn-outline-primary btn-block btn-sm"
                >
                  <i className="fas fa-eye mr-2"></i>
                  팀 상세 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .team-type-card {
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        
        .team-type-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
};

export default EditTeam;