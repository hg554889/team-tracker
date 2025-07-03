// client/src/pages/teams/CreateTeam.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import Spinner from '../../components/layout/Spinner';

const CreateTeam = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'study',
    description: '',
    members: []
  });
  
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/auth/users');
      // Filter out current user (they will be added as leader automatically)
      const users = (response.data || []).filter(u => u._id !== user?._id);
      setAvailableUsers(users);
    } catch (error) {
      console.error('Users fetch error:', error);
      setAlert('사용자 목록을 불러오는데 실패했습니다.', 'danger');
    } finally {
      setUsersLoading(false);
    }
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

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
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

    setLoading(true);
    
    try {
      const teamData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        members: selectedMembers
      };

      const response = await api.post('/teams', teamData);
      
      setAlert('팀이 성공적으로 생성되었습니다!', 'success');
      navigate(`/teams/${response.data._id}`);
    } catch (error) {
      console.error('Team creation error:', error);
      const message = error.response?.data?.message || '팀 생성에 실패했습니다.';
      setAlert(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말로 취소하시겠습니까?')) {
      navigate('/teams');
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

  const typeInfo = getTeamTypeInfo(formData.type);

  return (
    <div className="create-team">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>새 팀 생성</h1>
          <p className="text-muted mb-0">
            새로운 스터디 또는 프로젝트 팀을 생성합니다.
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

            {/* Team Members */}
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">팀 멤버 선택</h5>
                <small className="text-muted">
                  팀에 참여할 멤버를 선택하세요. (본인은 자동으로 리더로 설정됩니다)
                </small>
              </div>
              <div className="card-body">
                {usersLoading ? (
                  <div className="text-center py-4">
                    <Spinner />
                    <p className="text-muted mt-2">사용자 목록을 불러오는 중...</p>
                  </div>
                ) : availableUsers.length > 0 ? (
                  <div className="row">
                    {availableUsers.map(user => (
                      <div key={user._id} className="col-md-6 col-lg-4 mb-3">
                        <div 
                          className={`card member-card ${selectedMembers.includes(user._id) ? 'border-primary' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleMemberToggle(user._id)}
                        >
                          <div className="card-body d-flex align-items-center">
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(user._id)}
                              onChange={() => handleMemberToggle(user._id)}
                              className="mr-3"
                            />
                            <div 
                              className="user-avatar mr-3"
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#0366d6',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: '600'
                              }}
                            >
                              {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow-1">
                              <div className="font-weight-bold">
                                {user.name || user.username}
                              </div>
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-users fa-2x text-muted mb-3"></i>
                    <p className="text-muted">추가할 수 있는 멤버가 없습니다.</p>
                  </div>
                )}
                
                {selectedMembers.length > 0 && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">
                      선택된 멤버: {selectedMembers.length}명
                    </small>
                  </div>
                )}
              </div>
            </div>

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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    팀 생성
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
                {typeInfo.name} 팀 생성
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>팀 정보 요약</h6>
                <ul className="list-unstyled">
                  <li><strong>팀명:</strong> {formData.name || '(미입력)'}</li>
                  <li><strong>타입:</strong> {typeInfo.name}</li>
                  <li><strong>리더:</strong> {user?.name || user?.username}</li>
                  <li><strong>멤버 수:</strong> {selectedMembers.length + 1}명</li>
                </ul>
              </div>
              
              <div className="alert alert-info">
                <small>
                  <i className="fas fa-info-circle mr-2"></i>
                  팀이 생성되면 자동으로 첫 번째 주간 보고서를 작성할 수 있습니다.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .team-type-card {
          transition: all 0.2s ease-in-out;
        }
        
        .team-type-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .member-card {
          transition: all 0.2s ease-in-out;
        }
        
        .member-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

export default CreateTeam;