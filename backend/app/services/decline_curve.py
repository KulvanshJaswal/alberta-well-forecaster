import numpy as np
from scipy.optimize import curve_fit
import math

def arps_equation(t, qi, Di, b):
    return qi / (1 + b * Di * t)**(1/b)

def fit_decline_curve(production_data):
    oil_data = [r for r in production_data if r.oil > 0]
    gas_data = [r for r in production_data if r.gas > 0]
    water_data = [r for r in production_data if r.water > 0]

    results = {}

    for product, data in [("oil", oil_data), ("gas", gas_data), ("water", water_data)]:
        if len(data) < 3:
            results[product] = None
            continue
        
        values = [getattr(r, product) for r in data]
        time_steps = list(range(len(data)))
        
        try:
            params, _ = curve_fit(
                arps_equation, 
                time_steps, 
                values,
                p0=[max(values), 0.1, 0.5],
                maxfev=5000,
                bounds=(0, [np.inf, 1, 1.2])
            )
            results[product] = list(params)
        except Exception:
            results[product] = None

    return results

def forecast_production(qi, Di, b, months=12):
    plot_values = []
    for i in range (1, months+1):
        plot_values.append(arps_equation(i, qi, Di, b))
    return plot_values
