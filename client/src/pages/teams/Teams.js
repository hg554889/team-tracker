// client/src/pages/teams/Teams.js

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import Spinner from '../../components/layout/Spinner';
import TeamCard from './TeamCard';
import styled from 'styled-components';
import api from '../../services/api';

const TeamsContainer = styled.div`
  padding: 1.5rem;
`;

const TeamsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TeamsTitle = styled.h1`
  margin: 0;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const CreateButtonContainer = styled.div`
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CreateButton = styled(Link)`
  display: inline-block;
  background-color: #0366d6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0254ac;
    text-decoration: none;
    color: white;
  }
  
  @media (max-width: 768px) {
    display: block;
    width: 100%;
    text-align: center;
  }
`;

const SearchFilterContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
  
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const TeamGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const NoTeamsMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
`;

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await api.get('/teams');
        setTeams(res.data.data);
        setFilteredTeams(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('팀 목록 로드 오류:', err);
        setAlert('팀 목록을 불러오는데 실패했습니다', 'danger');
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [setAlert]);
  
  // 검색 및 필터링 적용
  useEffect(() => {
    let result = teams;
    
    // 검색어 필터링
    if (searchTerm) {
      result = result.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 유형 필터링
    if (typeFilter !== 'all') {
      result = result.filter(team => team.type === typeFilter);
    }
    
    setFilteredTeams(result);
  }, [teams, searchTerm, typeFilter]);
  
  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 필터 변경 핸들러
  const handleFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <TeamsContainer>
      <TeamsHeader>
        <TeamsTitle>팀 관리</TeamsTitle>
        
        {/* 조건을 임시로 제거하고 항상 버튼 표시 */}
        <CreateButtonContainer>
          <CreateButton to="/teams/create">
            <i className="fas fa-plus"></i> 새 팀 만들기
          </CreateButton>
        </CreateButtonContainer>
      </TeamsHeader>
      
      <SearchFilterContainer>
        <SearchInput 
          type="text" 
          placeholder="팀 이름 또는 설명으로 검색" 
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FilterSelect value={typeFilter} onChange={handleFilterChange}>
          <option value="all">모든 유형</option>
          <option value="project">프로젝트</option>
          <option value="study">스터디</option>
        </FilterSelect>
      </SearchFilterContainer>
      
      {filteredTeams.length > 0 ? (
        <TeamGridContainer>
          {filteredTeams.map(team => (
            <TeamCard key={team._id} team={team} />
          ))}
        </TeamGridContainer>
      ) : (
        <NoTeamsMessage>
          <p>조건에 맞는 팀이 없습니다.</p>
          {(user.role === 'admin' || user.role === 'leader') && (
            <CreateButton to="/teams/create" style={{ marginTop: '1rem' }}>
              <i className="fas fa-plus"></i> 새 팀 만들기
            </CreateButton>
          )}
        </NoTeamsMessage>
      )}
    </TeamsContainer>
  );
};

export default Teams;