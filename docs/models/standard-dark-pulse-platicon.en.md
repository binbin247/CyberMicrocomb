# Standard dark pulse (platicon)

[中文](./standard-dark-pulse-platicon.md)

## Simulation equations

This is a normal-dispersion single-field LLE for dark-pulse / platicon dynamics.
It uses the same single-field normalization as `Standard soliton`, keeps
second-order dispersion and one local mode shift, and intentionally omits Raman,
$d_3$, and $d_4$.
It uses the same photon-number-normalized intracavity field $A$, loaded loss
$\kappa=\kappa_0+\kappa_{\mathrm{ex}}$, input field
$|s_{\mathrm{in}}|^2=P_{\mathrm{in}}/\hbar\omega_p$, and detuning
$\delta_0=\omega_0-\omega_p$ as the standard soliton model.

### Dimensional physical equation

Let $A(\phi,T)$ be the slowly varying intracavity field. The dimensional equation
is

$$
\frac{\partial A}{\partial T}
=
\left[-\frac{\kappa}{2}-i\delta_0+i g|A|^2\right]A
-\frac{iD_2}{2}\frac{\partial^2A}{\partial\phi^2}
+i\mathcal{F}^{-1}
\left[
\Delta\Omega_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}\hat{A}_\mu
\right]
+\sqrt{\kappa_{\mathrm{ex}}}\,s_{\mathrm{in}} .
$$

Here $\Delta\Omega_{\mathrm{shift}}$ is the physical frequency shift of the
perturbed mode relative to the unperturbed modal grid. It approximates how an
avoided mode crossing or a local mode-coupling perturbation modifies the
integrated dispersion. Equivalently, the dimensional integrated dispersion is

$$
D_{\mathrm{int}}^{\mathrm{phys}}(\mu)
=
\frac{D_2\mu^2}{2}
+\Delta\Omega_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}.
$$

### Normalization

The normalization is the same as for `Standard soliton`:

$$
t=\frac{\kappa T}{2},\qquad
\psi=\sqrt{\frac{2g}{\kappa}}\,A,\qquad
\alpha=\frac{2\delta_0}{\kappa},
$$

$$
d_2=\frac{2D_2}{\kappa},\qquad
\Delta_{\mathrm{shift}}=\frac{2\Delta\Omega_{\mathrm{shift}}}{\kappa},\qquad
F=\sqrt{\frac{8g\kappa_{\mathrm{ex}}P_{\mathrm{in}}}{\hbar\omega_p\kappa^3}} .
$$

### Normalized equation solved by the page

The page solves

$$
\frac{\partial \psi}{\partial t}
=
[-(1+i\alpha)+i|\psi|^2]\psi
-\frac{i d_2}{2}\frac{\partial^2\psi}{\partial\phi^2}
+i\mathcal{F}^{-1}
\left[
\Delta_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}\hat{\psi}_\mu
\right]
+F.
$$

In the frequency domain this is equivalent to

$$
D_{\mathrm{int}}(\mu)
=
\frac{d_2\mu^2}{2}
+\Delta_{\mathrm{shift}}\delta_{\mu,\mu_{\mathrm{shift}}}.
$$

Here $d_2>0$ is normal dispersion in the current normalized convention,
$\mu_{\mathrm{shift}}$ is the selected integer mode, and
$\Delta_{\mathrm{shift}}$ is the mode-shift strength normalized to $\kappa/2$.
A positive `Mode shift strength` increases $D_{\mathrm{int}}$ at that mode. The
implementation shifts one mode only; it does not automatically perturb
$\pm\mu$ symmetrically.

## Physical picture

In normal dispersion, a bright soliton is not the natural stable state. The system
can instead form switching fronts between two continuous-wave backgrounds. These
fronts enclose a broad dark notch or flat-top structure: a dark pulse, also called
a platicon.

The local mode shift changes the integrated dispersion of one mode, emulating an
avoided mode crossing or a local perturbation near the pumped mode. This provides
a practical route for a normal-dispersion cavity to enter a low-noise dark-pulse
state.

Read the four plots as follows:

- `Temporal field`: look for a dark notch or flat-top switching-front structure
  on a high background.
- `Comb spectrum`: check the normal-dispersion comb and the lines near the
  shifted mode.
- `Intracavity energy`: check whether the normalized mean intracavity photon number / power proxy
  $\langle|\psi|^2\rangle$ settles.
- `Temporal evolution`: check whether the notch remains, drifts, or breaks up.

## Demo

### Demo 1: run the default preset

1. Select `Standard dark pulse (platicon)` in `MODEL`.
2. Keep the defaults: `grid = 512`, `Detuning = 4`, `Pump power = 3.94`,
   `D2 = 0.02`, `Mode shift position = 0`, `Mode shift strength = 4`.
3. Click `Play` and look for a dark notch on a high background.
4. Scan `Mode shift strength`: a weak shift may not trigger a stable dark pulse,
   while a very strong shift may create irregular spectra.
5. Change `Mode shift position` to see how the local perturbation reshapes the
   comb spectrum.
6. Scan `Detuning` and compare the platicon width, energy, and spectral bandwidth.

### Demo 2: detuning scan from noise to a dark pulse / platicon

1. Keep every default parameter except `Detuning`.
2. Set `Detuning` to a smaller value, for example `0`.
3. Click `Reset` so the field restarts from a noise or low-intensity initial
   state.
4. Click `Play`, then slowly scan `Detuning` upward to the default target value
   `4`.
5. Watch the dark notch form on the high background in `Temporal field`, and use
   `Intracavity energy` to check whether the dark-pulse state has stabilized.

This model is for teaching and fast exploration. It isolates the role of normal
dispersion and a local mode perturbation; it does not include thermal dynamics,
full mode-family coupling, or a complete avoided-crossing model.

## References

- X. Xue, Y. Xuan, Y. Liu, P.-H. Wang, S. Chen, J. Wang, D. E. Leaird, M. Qi, and A. M. Weiner, "Mode-locked dark pulse Kerr combs in normal-dispersion microresonators," *Nature Photonics* **9**, 594-600 (2015). <https://doi.org/10.1038/nphoton.2015.137>
- H. Wang, B. Shen, Y. Yu, Z. Yuan, C. Bao, W. Jin, L. Chang, M. A. Leal, A. Feshali, M. Paniccia, J. E. Bowers, and K. Vahala, "Self-regulating soliton switching waves in microresonators," *Physical Review A* **106**, 053508 (2022). <https://doi.org/10.1103/PhysRevA.106.053508>
