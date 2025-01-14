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
                <h1 id='teamLead'> Team lead: </h1>
                <p id='teamLeadName'>Nikolas Jarić {'(nikolas.jaric@fer.unizg.hr)'}</p>


            </div>

            <div className='team'>
                <h1 id='team'> Team: </h1>
                <p id='teamMember'> Matija Križević {'(matija.krizevic@fer.unizg.hr)'}</p>
                <p id='teamMember'> Petar Krtalić {'(petar.krtalic@fer.unizg.hr)'}</p>
                <p id='teamMember'> Ante Perić {'(ante.peric2@fer.unizg.hr)'}</p>
                <p id='teamMember'> Ema Skoko {'(ema.skoko@fer.unizg.hr)'}</p>
                <p id='teamMember'> Vice Sladoljev {'(vice.sladoljev@fer.unizg.hr)'}</p>
            </div>

            {/* ADD A PICTURE HERE */}
            <div className="teamPicture">
                <img src="../../../public/magnacreare_pic.png" alt="Team" className="teamImage" />
            </div>

            <button className='goToHomePage'id='changeButton' onClick={()=>navigate('/Quiz')}> Go to home page</button>

        </div>



    </div>)
}

export default Contacts;