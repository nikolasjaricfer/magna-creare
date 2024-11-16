import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import './contactsStyles.css'

const Contacts = () =>{

    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);

    return (
    
    
    <div>

        <div className='contacts'>
            <div className='teamLead'>
                <h4 id='teamLead'> Team lead: </h4>
                <p id='teamLeadName'>Nikolas Jarić {'(nikolas.jaric@fer.unizg.hr)'}</p>


            </div>

            <div className='team'>
                <h4 id='team'> Team: </h4>
                <p id='teamMember'> Matija Križević {'(matija.krizevic@fer.unizg.hr)'}</p>
                <p id='teamMember'> Petar Krtalić {'(petar.krtalic@fer.unizg.hr)'}</p>
                <p id='teamMember'> Ante Perić {'(ante.peric2@fer.unizg.hr)'}</p>
                <p id='teamMember'> Ema Skoko {'(ema.skoko.jaric@fer.unizg.hr)'}</p>
                <p id='teamMember'> Vice Sladoljev {'(vice.sladoljev.jaric@fer.unizg.hr)'}</p>
                
            </div>

            <button className='goToHomePage'id='changeButton' onClick={()=>navigate('/Quiz')}> Go to home page</button>

        </div>



    </div>)
}

export default Contacts;