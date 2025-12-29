/**
 * Activities Module
 * CRUD operations for activities
 */

const Activities = {
    /**
     * Add a new activity to a day
     * @param {number} dayIndex - Day index
     * @param {Object} activityData - Activity data
     */
    add(dayIndex, activityData) {
        State.daysData[dayIndex].activities.push(activityData);
        State.save();
    },

    /**
     * Update an existing activity
     * @param {number} dayIndex - Day index
     * @param {number} activityIndex - Activity index
     * @param {Object} activityData - New activity data
     */
    update(dayIndex, activityIndex, activityData) {
        // Preserve isDone state when updating
        const existingIsDone = State.daysData[dayIndex].activities[activityIndex].isDone || false;
        activityData.isDone = existingIsDone;
        State.daysData[dayIndex].activities[activityIndex] = activityData;
        State.save();
    },

    /**
     * Delete an activity
     * @param {number} dayIndex - Day index
     * @param {number} activityIndex - Activity index
     */
    delete(dayIndex, activityIndex) {
        State.daysData[dayIndex].activities.splice(activityIndex, 1);
        State.save();
    },

    /**
     * Toggle activity done status
     * @param {number} dayIndex - Day index
     * @param {number} activityIndex - Activity index
     */
    toggleDone(dayIndex, activityIndex) {
        const activity = State.daysData[dayIndex]?.activities[activityIndex];
        if (activity) {
            activity.isDone = !activity.isDone;
            State.save();
        }
    },

    /**
     * Get an activity by day and index
     * @param {number} dayIndex - Day index
     * @param {number} activityIndex - Activity index
     * @returns {Object|null} Activity or null
     */
    get(dayIndex, activityIndex) {
        return State.daysData[dayIndex]?.activities[activityIndex] || null;
    },

    /**
     * Get all activities for a day
     * @param {number} dayIndex - Day index
     * @returns {Array} Activities array
     */
    getForDay(dayIndex) {
        return State.daysData[dayIndex]?.activities || [];
    },

    /**
     * Get activities with prices for budget
     * @returns {Array} Array of {dayIndex, dayTitle, activities with price}
     */
    getWithPrices() {
        const result = [];
        State.daysData.forEach((day, dayIndex) => {
            const activitiesWithPrice = day.activities
                .map((activity, index) => ({ activity, originalIndex: index }))
                .filter(item => item.activity.price);

            if (activitiesWithPrice.length > 0) {
                result.push({
                    dayIndex,
                    dayTitle: day.title,
                    activities: activitiesWithPrice
                });
            }
        });
        return result;
    },

    /**
     * Separate mandatory and optional activities with original indices
     * @param {Array} activities - Activities array
     * @returns {Object} { mandatory: [], optional: [] }
     */
    separateByOptional(activities) {
        const mandatory = activities
            .map((activity, index) => ({ ...activity, originalIndex: index }))
            .filter(activity => !activity.isOptional);

        const optional = activities
            .map((activity, index) => ({ ...activity, originalIndex: index }))
            .filter(activity => activity.isOptional);

        return { mandatory, optional };
    },

    /**
     * Generate transfers between activities
     * @param {Array} activities - Activities with originalIndex
     * @returns {Array} Activities with transfer items inserted
     */
    generateWithTransfers(activities) {
        const result = [];
        const { MIN_DISTANCE, MAX_DISTANCE } = Config.TRANSFER;

        for (let i = 0; i < activities.length; i++) {
            const current = activities[i];
            result.push(current);

            const next = activities[i + 1];
            if (next && current.coordinates && next.coordinates) {
                const dist = Utils.haversineDistance(current.coordinates, next.coordinates);
                if (dist >= MIN_DISTANCE && dist < MAX_DISTANCE) {
                    result.push({
                        isTransfer: true,
                        from: current.name,
                        to: next.name,
                        coordinates: [current.coordinates, next.coordinates],
                        distance: dist.toFixed(2)
                    });
                }
            }
        }

        return result;
    },

    /**
     * Create activity data object from form values
     * @param {Object} formData - Form values
     * @returns {Object} Activity data object
     */
    createFromForm(formData) {
        return {
            time: formData.time,
            name: formData.name,
            description: formData.description,
            type: formData.type || 'normal',
            importantInfo: formData.importantInfo || null,
            price: formData.price || null,
            currency: formData.price ? formData.currency : null,
            isOptional: formData.isOptional,
            isDone: false,
            coordinates: formData.coordinates
        };
    }
};

Object.freeze(Activities);
