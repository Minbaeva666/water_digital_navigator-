import React from 'react';
import {Modal, Button, ButtonProps} from 'antd';

interface GenericModalProps {
    open: boolean;
    title: React.ReactNode;
    text: React.ReactNode;
    onCancel?: () => void;
    onConfirm: () => void;
    cancelText?: React.ReactNode;
    confirmText?: React.ReactNode;
    confirmButtonProps?: ButtonProps;
    closable?: boolean;
}

const GenericModal: React.FC<GenericModalProps> = ({
                                                       open,
                                                       title,
                                                       text,
                                                       onCancel,
                                                       onConfirm,
                                                       cancelText,
                                                       confirmText = 'Weiter',
                                                       confirmButtonProps,
                                                       closable = true
                                                   }) => (


    <Modal
        title={title}
        open={open}
        closable={closable}
        onCancel={onCancel}
        footer={[
            ...(onCancel
                ? [<Button key="cancel" onClick={onCancel}>{cancelText}</Button>]
                : []),
            <Button key="confirm" type="primary" {...confirmButtonProps} onClick={onConfirm}>
                {confirmText}
            </Button>,
        ]}
    >
        <p>{text}</p>
    </Modal>
);

export default GenericModal;
