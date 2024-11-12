import React, { useState } from 'react'
import './AccountInfo.css'
import user_icon from '../Assets/AnonProfil.jpeg'

function AccountInfo(){

    return (
        <>
            <div className="container">
                <p className="hello">Hello, username!</p>

                <a>
                    <button className='goToHomePage'>Go back to home page</button>
                </a>
                
                <div className='icon'> 
                    <img className="user_icon" src = {user_icon} alt="user_icon"></img>
                </div>

                <div className="username">
                    <a>
                        <button className='changeButton'>
                            Change username
                        </button>
                    </a>
                    
                </div>
                <div className="password">
                    <a>
                        <button className='changeButton'>
                            Change password
                        </button>
                    </a>
                </div>
            </div>
        </>
    )
}

export default AccountInfo