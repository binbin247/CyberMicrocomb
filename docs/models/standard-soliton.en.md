# Standard soliton

[中文](./standard-soliton.md)

## Simulation equations

This model is a single-field normalized Lugiato-Lefever equation (LLE). The slow
time is $t$, the azimuthal coordinate is $\phi \in [-\pi,\pi)$, and the
relative mode number is $\mu$. The simulated variable $\psi(\phi,t)$ is the
normalized intracavity field envelope.

$$
\frac{\partial \psi}{\partial t}
=
\left[-(1+i\alpha)+iD_{\mathrm{int}}(\mu)+i|\psi|^2\right]\psi
+F+i\tau_R\psi\frac{\partial |\psi|^2}{\partial \phi}.
$$

The dispersion operator is defined in the frequency domain as

$$
D_{\mathrm{int}}(\mu)
=
\frac{d_2\mu^2}{2}
+\frac{d_3\mu^3}{6}
+\frac{d_4\mu^4}{24}.
$$

Here $\alpha$ is the normalized pump-resonance detuning, $F$ is the normalized
pump amplitude, $d_2,d_3,d_4$ are normalized integrated-dispersion coefficients,
and $\tau_R$ is the Raman shock coefficient. The current implementation uses a
first-order split-step update: time-domain Kerr/Raman update, frequency-domain
linear propagation, and explicit pump injection.

## Physical picture

Standard soliton describes a bright dissipative Kerr soliton in an anomalous-
dispersion microresonator. The steady state is set by the balance between cavity
loss, continuous-wave pumping, Kerr nonlinear phase shift, and anomalous
dispersion. The pump compensates loss, the Kerr effect gives an intensity-
dependent phase, and anomalous dispersion balances that phase to form a localized
bright pulse.

In the temporal plot, the soliton appears as a localized intensity peak. In the
spectrum, it appears as a broad coherent comb around the pumped mode. Increasing
detuning usually changes the pulse width and peak intensity. Nonzero $d_3$ or
$d_4$ goes beyond the simple quadratic dispersion approximation and can create
asymmetric spectra or dispersive-wave features. Nonzero $\tau_R$ changes the
nonlinear phase through $i\tau_R\psi\partial_\phi|\psi|^2$, enabling interactive
exploration of Raman self-frequency-shift-like behavior.

## Demo

1. Select `Standard soliton` in `MODEL`.
2. Use the defaults: `grid = 512`, `Detuning = 10`, `Pump power = 3.94`,
   `D2 = -0.0444`, `D3 = 0`, `D4 = 0`, `tauR = 0`.
3. Click `Play`.
4. Watch the localized bright pulse in `Temporal field` and the comb around the
   pumped mode in `Comb spectrum`.
5. Scan `Detuning` and compare pulse peak, pulse width, and `Intracavity energy`.
6. Increase `tauR` slowly from 0 to see how the Raman shock term changes the pulse
   and spectrum.

If the state diverges or the spectrum becomes numerically noisy, reduce `dt` or
lower `Pump power`. The solver clamps oversized timesteps using
$\max |D_{\mathrm{int}}|\,dt < \pi$ to reduce dispersion-phase aliasing.

## References

- L. A. Lugiato and R. Lefever, "Spatial dissipative structures in passive optical systems," *Physical Review Letters* **58**, 2209 (1987).
- Y. K. Chembo and C. R. Menyuk, "Spatiotemporal Lugiato-Lefever formalism for Kerr-comb generation in whispering-gallery-mode resonators," *Physical Review A* **87**, 053852 (2013). <https://doi.org/10.1103/PhysRevA.87.053852>
