/**
 * Encryption Status Component
 * Displays encryption progress with phases
 */
import { Shield, Lock, Upload, CheckCircle } from 'lucide-react';

const phases = [
    { id: 'encrypting', label: 'Encrypting', icon: Lock, description: 'AES-256 encryption in progress' },
    { id: 'uploading', label: 'Uploading', icon: Upload, description: 'Transferring encrypted data' },
    { id: 'complete', label: 'Complete', icon: CheckCircle, description: 'Securely stored' },
];

const EncryptionStatus = ({ currentPhase, progress = 0 }) => {
    const currentIndex = phases.findIndex(p => p.id === currentPhase);

    return (
        <div className="encryption-status">
            <div className="encryption-header">
                <Shield className="encryption-icon" />
                <span className="encryption-title">Client-Side Encryption</span>
            </div>

            <div className="encryption-phases">
                {phases.map((phase, index) => {
                    const Icon = phase.icon;
                    const isActive = index === currentIndex;
                    const isComplete = index < currentIndex;
                    const isPending = index > currentIndex;

                    return (
                        <div
                            key={phase.id}
                            className={`phase ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''} ${isPending ? 'pending' : ''}`}
                        >
                            <div className="phase-indicator">
                                <Icon className="phase-icon" />
                            </div>
                            <div className="phase-info">
                                <span className="phase-label">{phase.label}</span>
                                {isActive && (
                                    <span className="phase-description">{phase.description}</span>
                                )}
                            </div>
                            {isActive && currentPhase !== 'complete' && (
                                <div className="phase-progress">
                                    <div
                                        className="phase-progress-bar"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="encryption-info">
                <div className="info-badge">
                    <Lock className="info-icon" />
                    <span>Zero-Knowledge: Server never sees your data</span>
                </div>
            </div>

            <style>{`
                .encryption-status {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 12px;
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                }

                .encryption-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .encryption-icon {
                    width: 20px;
                    height: 20px;
                    color: var(--color-primary, #3b82f6);
                }

                .encryption-title {
                    font-weight: 600;
                    color: var(--color-text-primary, #fff);
                }

                .encryption-phases {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .phase {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .phase.active {
                    background: rgba(59, 130, 246, 0.15);
                }

                .phase.complete {
                    opacity: 0.7;
                }

                .phase.pending {
                    opacity: 0.4;
                }

                .phase-indicator {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(59, 130, 246, 0.2);
                }

                .phase.active .phase-indicator {
                    background: var(--color-primary, #3b82f6);
                    animation: pulse 1.5s infinite;
                }

                .phase.complete .phase-indicator {
                    background: #10b981;
                }

                .phase-icon {
                    width: 16px;
                    height: 16px;
                    color: #fff;
                }

                .phase-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .phase-label {
                    font-weight: 500;
                    color: var(--color-text-primary, #fff);
                }

                .phase-description {
                    font-size: 0.75rem;
                    color: var(--color-text-secondary, #94a3b8);
                }

                .phase-progress {
                    width: 60px;
                    height: 4px;
                    background: rgba(59, 130, 246, 0.2);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .phase-progress-bar {
                    height: 100%;
                    background: var(--color-primary, #3b82f6);
                    transition: width 0.3s ease;
                }

                .encryption-info {
                    margin-top: 1rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .info-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--color-text-secondary, #94a3b8);
                }

                .info-icon {
                    width: 14px;
                    height: 14px;
                    color: #10b981;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
};

export default EncryptionStatus;
