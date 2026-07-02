# Standard soliton

[中文](./standard-soliton.md)

## Simulation equations

This section separates the dimensional physical equation from the normalized
equation solved by the page. $T$ is the physical slow time,
$\phi\in[-\pi,\pi)$ is the azimuthal coordinate, and $\mu$ is the relative mode
number.

The notation follows the input-output convention used in the Feishu knowledge
base: the intracavity slow field is first written as a photon-number-normalized
amplitude $A$, so $|A|^2$ is the intracavity photon number;
$\kappa=\kappa_0+\kappa_{\mathrm{ex}}$ is the loaded loss rate; and
$|s_{\mathrm{in}}|^2=P_{\mathrm{in}}/\hbar\omega_p$. The detuning is defined as
$\delta_0=\omega_0-\omega_p$, i.e. the cold-cavity resonance frequency relative
to the pump. The UI control `Detuning` is $\alpha=2\delta_0/\kappa$.

### Dimensional physical equation

Let $A(\phi,T)$ be the slowly varying intracavity field, with $|A|^2$ measured as
intracavity photon number. A single-field microresonator LLE can be written as

$$
\frac{\partial A}{\partial T}
=
\left[-\frac{\kappa}{2}-i\delta_0+i g|A|^2\right]A
+iD_{\mathrm{int}}^{\mathrm{phys}}(-i\partial_\phi)A
+\sqrt{\kappa_{\mathrm{ex}}}\,s_{\mathrm{in}} .
$$

Here $\kappa$ is the total loss rate, $\kappa_{\mathrm{ex}}$ is the external
coupling loss rate, and $g$ is the single-photon Kerr shift. The classic
second-order LLE keeps only $D_2$:

$$
\frac{\partial A}{\partial T}
=
\left[-\frac{\kappa}{2}-i\delta_0+i g|A|^2\right]A
-\frac{iD_2}{2}\frac{\partial^2A}{\partial\phi^2}
+\sqrt{\kappa_{\mathrm{ex}}}\,s_{\mathrm{in}} .
$$

Higher-order dispersion and Raman shock add the perturbations

$$
\mathcal{P}_{\mathrm{HOD}}^{\mathrm{phys}}
=
-\frac{D_3}{6}\frac{\partial^3A}{\partial\phi^3}
+\frac{iD_4}{24}\frac{\partial^4A}{\partial\phi^4},
$$

$$
\mathcal{P}_{\mathrm{Raman}}^{\mathrm{phys}}
=
i g D_1 T_R\,A\frac{\partial |A|^2}{\partial\phi}.
$$

Here $D_1$ is the angular-frequency FSR and $T_R$ is the Raman shock time. The
dimensional integrated dispersion is

$$
D_{\mathrm{int}}^{\mathrm{phys}}(\mu)
=
\frac{D_2\mu^2}{2}
+\frac{D_3\mu^3}{6}
+\frac{D_4\mu^4}{24}.
$$

### Normalization

The page normalizes time by the loss half-linewidth and field amplitude by the
Kerr nonlinearity:

$$
t=\frac{\kappa T}{2},\qquad
\psi=\sqrt{\frac{2g}{\kappa}}\,A .
$$

The dimensionless parameters are

$$
\alpha=\frac{2\delta_0}{\kappa},\qquad
d_m=\frac{2D_m}{\kappa}\quad(m=2,3,4),
$$

$$
F=\sqrt{\frac{8g\kappa_{\mathrm{ex}}P_{\mathrm{in}}}
{\hbar\omega_p\kappa^3}},\qquad
\tau_R=D_1T_R .
$$

The sign of $\tau_R$ also depends on the positive direction of $\phi$; this page
uses $+i\tau_R\psi\partial_\phi|\psi|^2$.

### Normalized equation solved by the page

The pure second-order LLE without Raman response is

$$
\frac{\partial \psi}{\partial t}
=
[-(1+i\alpha)+i|\psi|^2]\psi
-\frac{i d_2}{2}\frac{\partial^2\psi}{\partial\phi^2}
+F.
$$

Higher-order dispersion and Raman are added as perturbations:

$$
\frac{\partial \psi}{\partial t}
=
\left.\frac{\partial \psi}{\partial t}\right|_{\mathrm{classic}}
-\frac{d_3}{6}\frac{\partial^3\psi}{\partial\phi^3}
+\frac{i d_4}{24}\frac{\partial^4\psi}{\partial\phi^4}
+i\tau_R\psi\frac{\partial |\psi|^2}{\partial \phi}.
$$

Setting $d_3=d_4=\tau_R=0$ recovers the classic second-order LLE. Equivalently,
the dispersion operator is $iD_{\mathrm{int}}(-i\partial_\phi)\psi$. With the
Fourier convention $\partial_\phi\to i\mu$, the frequency-domain integrated
dispersion is

$$
D_{\mathrm{int}}(\mu)
=
\frac{d_2\mu^2}{2}
+\frac{d_3\mu^3}{6}
+\frac{d_4\mu^4}{24}.
$$

The solver uses a first-order split-step update: Kerr/Raman terms in the time
domain, loss-detuning-dispersion terms in the frequency domain, and explicit pump
injection.

## Physical picture

The standard soliton is set by a compact balance: the continuous-wave pump
compensates cavity loss, Kerr nonlinearity gives an intensity-dependent phase
shift, and anomalous dispersion ($d_2<0$) balances that nonlinear phase to form a
localized bright pulse.

Read the four plots as follows:

- `Temporal field`: check whether $|\psi|^2$ forms a narrow bright peak.
- `Comb spectrum`: check whether a broad comb envelope appears around the pump.
- `Intracavity energy`: check whether the normalized mean intracavity photon number / power proxy
  $\langle|\psi|^2\rangle$ settles.
- `Temporal evolution`: check whether the pulse drifts, splits, or destabilizes.

Increasing detuning usually changes the pulse width and peak intensity. Nonzero
$d_3$ or $d_4$ adds higher-order dispersion, which can generate asymmetric
spectra or dispersive-wave features. Nonzero $\tau_R$ changes the nonlinear
phase through $i\tau_R\psi\partial_\phi|\psi|^2$, enabling interactive
exploration of Raman self-frequency-shift-like behavior.

## Demo

### Demo 1: run the default preset

1. Select `Standard soliton` in `MODEL`.
2. Keep the defaults: `grid = 512`, `Detuning = 10`, `Pump power = 3.94`,
   `D2 = -0.0444`, `D3 = 0`, `D4 = 0`, `tauR = 0`.
3. Click `Play` and first confirm that a stable bright pulse appears in the time
   domain.
4. Slowly scan `Detuning` and compare the pulse width, peak intensity, and
   energy trace.
5. Set `D3` or `D4` to a nonzero value to observe spectral asymmetry or narrow
   dispersive-wave-like features.
6. Increase `tauR` slightly from 0 to inspect Raman-induced pulse and spectral
   shifts.

### Demo 2: detuning scan from noise to a bright soliton

1. Keep every default parameter except `Detuning`.
2. Set `Detuning` to a smaller value, for example `-5`.
3. Click `Reset` so the field returns to a noise or low-intensity initial state.
4. Click `Play`, then slowly scan `Detuning` upward to the default target value
   `10`.
5. Watch a bright soliton form from the noisy background in `Temporal field`, and
   check that `Intracavity energy` settles onto a stable plateau.

### Demo 3: breather soliton

1. First use the default parameters to obtain a stable bright soliton.
2. Keep `D3 = 0`, `D4 = 0`, and `tauR = 0`; tune only the drive parameters.
3. Slowly lower `Detuning` from the default value `10` toward roughly `6` to `8`.
   If the breathing is weak, increase `Pump power` moderately to about `4.5` to
   `5.5` and continue scanning `Detuning`.
4. Look for periodic oscillations in `Intracavity energy`, rather than a flat
   steady plateau.
5. In `Temporal evolution`, confirm that the soliton stripe periodically
   broadens, narrows, or changes brightness.
6. If the pulse disappears or enters strong chaos, return to the previous stable
   point, reduce the scan step, and lower `Pump power` if needed.

A breather soliton is an oscillatory dynamical state of the same LLE, not a new
equation. It appears near stability boundaries of the stationary soliton branch.

### Demo 4: soliton Cherenkov radiation / dispersive wave

1. First use the default parameters to obtain a stable bright soliton.
2. Keep `tauR = 0`, then add a higher-order-dispersion perturbation. A useful
   starting point is `D3 = 0.003` to `0.006`, or a small nonzero `D4`.
3. Click `Play` and inspect `Comb spectrum`. The signature of soliton Cherenkov
   radiation is a relatively narrow enhanced spectral peak or shoulder on one
   side of the broad soliton comb envelope.
4. Reverse the sign of `D3` and check whether the enhanced spectral feature moves
   to the opposite side of the spectrum.
5. If the spectrum becomes numerically noisy, reduce `dt` first, or reduce the
   magnitude of `D3`/`D4`.

This demo shows phase-matched radiation induced by higher-order dispersion. In
the time domain it often appears as an oscillatory soliton tail; in the frequency
domain it appears as a dispersive-wave peak away from the pumped mode.

If the state diverges or the spectrum becomes numerically noisy, reduce `dt` or
lower `Pump power` first. The solver clamps oversized timesteps using
$\max |D_{\mathrm{int}}|\,dt < \pi$ to reduce dispersion-phase aliasing; final
quantitative studies should still use a higher-order integrator.

## References

- T. Herr, V. Brasch, J. D. Jost, C. Y. Wang, N. M. Kondratiev, M. L. Gorodetsky, and T. J. Kippenberg, "Temporal solitons in optical microresonators," *Nature Photonics* **8**, 145-152 (2014). <https://doi.org/10.1038/nphoton.2013.343>
