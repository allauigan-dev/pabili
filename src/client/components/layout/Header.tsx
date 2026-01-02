import React from 'react';
import { NavLink } from 'react-router-dom';

export const Header: React.FC = () => {
    return (
        <header className="app-header">
            <div className="app-header-container">
                <NavLink to="/" className="app-header-logo">
                    <div className="app-header-logo-icon">
                        P
                    </div>
                    <span className="app-header-brand">Pabili</span>
                </NavLink>

                <div className="app-header-actions">
                    <div style={{ paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                        <div className="app-header-avatar">
                            AD
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
