const game = {
    state: {
        quarter: 1,
        score: 100,
        fedRate: 2.00,
        inflation: 2.0,
        unemployment: 4.0,
        gdp: 2.5,
        confidence: 100.0,
        stock: 0.0,
        history: [],
        maxQuarters: 12,
        pendingChange: 0,
        formSubmitted: false
    },

    newsEvents: [
        "Global trade tensions escalate, affecting export markets.",
        "Technology sector reports strong earnings, boosting confidence.",
        "Energy prices surge, raising inflation concerns.",
        "Labor market tightens, with reports of wage increases.",
        "Consumer spending slows due to uncertainty."
    ],

    init() {
        console.log("Game initialized");
        this.updateUI();
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('raise-rate').addEventListener('click', () => {
            if (this.state.quarter > this.state.maxQuarters) {
                this.showEndGameModal();
            } else {
                this.showOutcomes(0.25);
            }
        });
        document.getElementById('hold-rate').addEventListener('click', () => {
            if (this.state.quarter > this.state.maxQuarters) {
                this.showEndGameModal();
            } else {
                this.showOutcomes(0);
            }
        });
        document.getElementById('lower-rate').addEventListener('click', () => {
            if (this.state.quarter > this.state.maxQuarters) {
                this.showEndGameModal();
            } else {
                this.showOutcomes(-0.25);
            }
        });
        document.getElementById('apply-custom-rate').addEventListener('click', () => {
            if (this.state.quarter > this.state.maxQuarters) {
                this.showEndGameModal();
            } else {
                this.showCustomOutcomes();
            }
        });
        document.getElementById('confirm-rate').addEventListener('click', () => this.confirmRateChange());
        document.getElementById('cancel-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('submit-form').addEventListener('click', () => this.submitForm());
        document.getElementById('cancel-form').addEventListener('click', () => this.cancelForm());
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        document.getElementById('no-restart').addEventListener('click', () => this.closeEndGameModal());
    },

    updateUI() {
        document.getElementById('score').textContent = this.state.score;
        document.getElementById('quarter').textContent = `${this.state.quarter}/12`;
        document.getElementById('fed-rate').textContent = `${this.state.fedRate.toFixed(2)}%`;
        document.getElementById('inflation').textContent = `${this.state.inflation.toFixed(1)}%`;
        document.getElementById('unemployment').textContent = `${this.state.unemployment.toFixed(1)}%`;
        document.getElementById('gdp').textContent = `${this.state.gdp.toFixed(1)}%`;
        document.getElementById('confidence').textContent = this.state.confidence.toFixed(1);
        document.getElementById('stock').textContent = `${this.state.stock.toFixed(1)}%`;
        document.getElementById('news').textContent = `Quarter ${this.state.quarter}/12: ${this.newsEvents[Math.floor(Math.random() * this.newsEvents.length)]}`;
        const historyList = document.getElementById('history');
        historyList.innerHTML = this.state.history.map(h => `<li>${h}</li>`).join('');
    },

    showAlert(message, type) {
        const alert = document.getElementById('alert');
        alert.textContent = message;
        alert.className = `alert ${type}`;
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 3000);
    },

    showOutcomes(change) {
        this.state.pendingChange = change;
        let outcomes = this.simulateEconomicImpact(change);
        let text = change > 0 ?
            `Raising the rate by 0.25% may:
            - Reduce inflation by ~0.2% (new: ${(this.state.inflation + outcomes.inflation).toFixed(1)}%)
            - Increase unemployment by ~0.3% (new: ${(this.state.unemployment + outcomes.unemployment).toFixed(1)}%)
            - Reduce GDP growth by ~0.2% (new: ${(this.state.gdp + outcomes.gdp).toFixed(1)}%)
            - Lower consumer confidence by ~5 points (new: ${(this.state.confidence + outcomes.confidence).toFixed(1)})
            - Decrease stock market by ~2% (new: ${(this.state.stock + outcomes.stock).toFixed(1)}%)
            - Score change: ${(this.state.inflation + outcomes.inflation > 2.5 || this.state.unemployment + outcomes.unemployment > 5) ? -10 : 5}` :
            change < 0 ?
            `Lowering the rate by 0.25% may:
            - Increase inflation by ~0.3% (new: ${(this.state.inflation + outcomes.inflation).toFixed(1)}%)
            - Reduce unemployment by ~0.2% (new: ${(this.state.unemployment + outcomes.unemployment).toFixed(1)}%)
            - Increase GDP growth by ~0.3% (new: ${(this.state.gdp + outcomes.gdp).toFixed(1)}%)
            - Raise consumer confidence by ~5 points (new: ${(this.state.confidence + outcomes.confidence).toFixed(1)})
            - Increase stock market by ~2% (new: ${(this.state.stock + outcomes.stock).toFixed(1)}%)
            - Score change: ${(this.state.inflation + outcomes.inflation < 1.5 || this.state.unemployment + outcomes.unemployment < 3) ? -10 : 5}` :
            `Holding the rate steady may:
            - Cause minor fluctuations in inflation (±0.1%)
            - Cause minor fluctuations in unemployment (±0.1%)
            - Cause minor fluctuations in GDP growth (±0.1%)
            - Cause minor changes in consumer confidence (±2)
            - Cause minor changes in stock market (±1%)
            - Score change: ${(Math.abs(this.state.inflation - 2) < 0.5 && Math.abs(this.state.unemployment - 4) < 0.5) ? 10 : -5}`;
        document.getElementById('modal-title').textContent = 'Possible Outcomes';
        document.getElementById('modal-text').textContent = text;
        document.getElementById('modal').style.display = 'flex';
    },

    showCustomOutcomes() {
        const customRate = parseFloat(document.getElementById('custom-rate').value);
        if (isNaN(customRate) || customRate < -this.state.fedRate) {
            this.showAlert("Invalid rate change!", "error");
            return;
        }
        this.state.pendingChange = customRate;
        const scaledImpact = this.simulateEconomicImpact(customRate);
        let text = `Changing the rate by ${customRate.toFixed(2)}% may:
            - Change inflation by ~${(scaledImpact.inflation).toFixed(1)}% (new: ${(this.state.inflation + scaledImpact.inflation).toFixed(1)}%)
            - Change unemployment by ~${(scaledImpact.unemployment).toFixed(1)}% (new: ${(this.state.unemployment + scaledImpact.unemployment).toFixed(1)}%)
            - Change GDP growth by ~${(scaledImpact.gdp).toFixed(1)}% (new: ${(this.state.gdp + scaledImpact.gdp).toFixed(1)}%)
            - Change consumer confidence by ~${(scaledImpact.confidence).toFixed(1)} (new: ${(this.state.confidence + scaledImpact.confidence).toFixed(1)})
            - Change stock market by ~${(scaledImpact.stock).toFixed(1)}% (new: ${(this.state.stock + scaledImpact.stock).toFixed(1)}%)
            - Score change: ${(this.state.inflation + scaledImpact.inflation > 2.5 || this.state.unemployment + scaledImpact.unemployment > 5 || this.state.inflation + scaledImpact.inflation < 1.5 || this.state.unemployment + scaledImpact.unemployment < 3) ? -10 : 5}`;
        document.getElementById('modal-title').textContent = 'Possible Outcomes';
        document.getElementById('modal-text').textContent = text;
        document.getElementById('modal').style.display = 'flex';
    },

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    },

    showForm() {
        document.getElementById('form-modal').style.display = 'flex';
    },

    submitForm() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const countryCode = document.getElementById('country-code').value;
        const mobile = document.getElementById('mobile').value;
        if (!name || !email || !countryCode || !mobile) {
            this.showAlert("Please fill out all fields!", "error");
            return;
        }
        this.state.formSubmitted = true;
        this.saveFormData(name, email, countryCode, mobile);
        document.getElementById('form-modal').style.display = 'none';
        this.showAlert("Form submitted successfully! Details saved to detail.csv.", "success");
    },

    saveFormData(name, email, countryCode, mobile) {
        const csvContent = `Name,Email,Mobile\n${name},${email},${countryCode}${mobile}\n`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'detail.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    },

    cancelForm() {
        document.getElementById('form-modal').style.display = 'none';
        this.showAlert("Game ended due to form cancellation.", "warning");
        setTimeout(() => location.reload(), 3000);
    },

    showEndGameModal() {
        document.getElementById('endgame-text').textContent = `This simulation is over, your score is ${this.state.score}.`;
        document.getElementById('endgame-modal').style.display = 'flex';
    },

    closeEndGameModal() {
        document.getElementById('endgame-modal').style.display = 'none';
    },

    restartGame() {
        this.state = {
            quarter: 1,
            score: 100,
            fedRate: 2.00,
            inflation: 2.0,
            unemployment: 4.0,
            gdp: 2.5,
            confidence: 100.0,
            stock: 0.0,
            history: [],
            maxQuarters: 12,
            pendingChange: 0,
            formSubmitted: false
        };
        this.updateUI();
        this.closeEndGameModal();
    },

    confirmRateChange() {
        this.closeModal();
        if (this.state.quarter === 4 && !this.state.formSubmitted) {
            this.showForm();
        } else {
            this.adjustRate(this.state.pendingChange);
        }
        document.getElementById('custom-rate').value = '';
    },

    adjustRate(change) {
        this.state.fedRate = Math.max(0, this.state.fedRate + change);
        let impact = this.simulateEconomicImpact(change);
        this.state.inflation += impact.inflation;
        this.state.unemployment += impact.unemployment;
        this.state.gdp += impact.gdp;
        this.state.confidence += impact.confidence;
        this.state.stock += impact.stock;
        this.state.score += impact.score;
        this.state.quarter++;

        this.state.history.push(`Quarter ${this.state.quarter}/12: Changed rate by ${change.toFixed(2)}%. Score: ${this.state.score}`);

        if (this.state.quarter > this.state.maxQuarters) {
            this.showAlert(`Game Over! Final Score: ${this.state.score}.`, this.state.score >= 80 ? "success" : "warning");
        } else if (this.state.score <= 0) {
            this.showAlert("Game Over! Economic instability reached critical levels.", "error");
            setTimeout(() => this.restartGame(), 3000);
        } else if (this.state.inflation > 5 || this.state.unemployment > 7) {
            this.showAlert("Warning: Economic indicators are unstable!", "warning");
        } else {
            this.showAlert("Rate adjusted. Economy updated.", "success");
        }

        this.updateUI();
    },

    simulateEconomicImpact(change) {
        let impact = { inflation: 0, unemployment: 0, gdp: 0, confidence: 0, stock: 0, score: 0 };
        const scale = Math.abs(change) / 0.25;

        if (change > 0) {
            impact.inflation -= 0.2 * scale;
            impact.unemployment += 0.3 * scale;
            impact.gdp -= 0.2 * scale;
            impact.confidence -= 5 * scale;
            impact.stock -= 2 * scale;
            impact.score = (this.state.inflation + impact.inflation > 2.5 || this.state.unemployment + impact.unemployment > 5) ? -10 : 5;
        } else if (change < 0) {
            impact.inflation += 0.3 * scale;
            impact.unemployment -= 0.2 * scale;
            impact.gdp += 0.3 * scale;
            impact.confidence += 5 * scale;
            impact.stock += 2 * scale;
            impact.score = (this.state.inflation + impact.inflation < 1.5 || this.state.unemployment + impact.unemployment < 3) ? -10 : 5;
        } else {
            impact.inflation += Math.random() * 0.1 - 0.05;
            impact.unemployment += Math.random() * 0.1 - 0.05;
            impact.gdp += Math.random() * 0.1 - 0.05;
            impact.confidence += Math.random() * 2 - 1;
            impact.stock += Math.random() * 1 - 0.5;
            impact.score = (Math.abs(this.state.inflation - 2) < 0.5 && Math.abs(this.state.unemployment - 4) < 0.5) ? 10 : -5;
        }

        return impact;
    }
};

// Initialize the game
try {
    game.init();
} catch (error) {
    console.error("Failed to initialize game:", error);
}
