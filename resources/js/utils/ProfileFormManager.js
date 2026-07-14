export default class ProfileFormManager {
    constructor(initialData = {}, onChange = null) {
        this.user = initialData.user || {};
        this.member = initialData.member || {};
        this.errors = {};
        this.isSubmitting = false;
        this.original = this._snapshot();
        this.onChange = onChange;
    }

    _snapshot() {
        return {
            user: { ...this.user },
            member: { ...this.member },
        };
    }

    get hasChanges() {
        const current = this._snapshot();
        return JSON.stringify(current) !== JSON.stringify(this.original);
    }

    setUserField(field, value) {
        this.user[field] = value;
        this._clearError(`user.${field}`);
        this._notifyChange();
    }

    setMemberField(field, value) {
        this.member[field] = value;
        this._clearError(`member.${field}`);
        this._notifyChange();
    }

    setError(field, message) {
        this.errors[field] = message;
        this._notifyChange();
    }

    _clearError(field) {
        delete this.errors[field];
    }

    getError(field) {
        return this.errors[field] || null;
    }

    getFormData() {
        return {
            user: { ...this.user },
            member: { ...this.member },
        };
    }

    reset(initialData = {}) {
        this.user = initialData.user || {};
        this.member = initialData.member || {};
        this.errors = {};
        this.original = this._snapshot();
        this._notifyChange();
    }

    setSubmitting(value) {
        this.isSubmitting = value;
        this._notifyChange();
    }

    _notifyChange() {
        if (typeof this.onChange === 'function') {
            this.onChange();
        }
    }
}
